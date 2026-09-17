import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditor } from "../../context/EditorContext";
import toast from "react-hot-toast";
import {
    connectCollaboration,
    getCollaborationSocket,
} from "../../collaboration/collaborationSocket";
import {
    getFileById,
    saveFile as saveFileToIndexedDB,
    getOperations,
    addOperation,
    updateOperation,
    deleteOperation,
} from "../../database/indexedDB";

const DEFAULT_EDITOR_SETTINGS = {
    theme: "dark",
    fontSize: 14,
    wordWrap: true,
    minimap: true,
};

function CodeEditor({ projectId }) {
    const {
        activeFile,
        files,
        setFiles,
        dirtyFiles,
        setDirtyFiles,
        setSaveStatus,
        explorer,
        setEditorInstance,
    } = useEditor();

    const [editorSettings, setEditorSettings] = useState(() => {
        try {
            const savedSettings =
                localStorage.getItem("codeSyncSettings");

            if (savedSettings) {
                return {
                    ...DEFAULT_EDITOR_SETTINGS,
                    ...JSON.parse(savedSettings),
                };
            }
        } catch (error) {
            console.error(
                "Failed to load editor settings:",
                error
            );
        }

        return DEFAULT_EDITOR_SETTINGS;
    });

    const timer = useRef(null);
    const isApplyingRemoteChange = useRef(false);
    const editorRef = useRef(null);

    const activeFileRef = useRef(activeFile);
    const filesRef = useRef(files);
    const explorerRef = useRef(explorer);

    useEffect(() => {
        activeFileRef.current = activeFile;
        filesRef.current = files;
        explorerRef.current = explorer;
    }, [activeFile, files, explorer]);

    useEffect(() => {
        const socket = connectCollaboration();

        if (!socket) return;

        const handleFileChange = ({
            fileId,
            content,
        }) => {
            const currentFile =
                activeFileRef.current;

            const currentExplorer =
                explorerRef.current;

            if (!fileId || !currentFile) {
                return;
            }

            const findFileById = (tree) => {
                for (const node of tree) {
                    if (
                        node.type === "file" &&
                        node.id === fileId
                    ) {
                        return node;
                    }

                    if (node.children) {
                        const found =
                            findFileById(
                                node.children
                            );

                        if (found) {
                            return found;
                        }
                    }
                }

                return null;
            };

            const file = findFileById(
                currentExplorer
            );

            if (!file || file.name !== currentFile) {
                return;
            }

            console.log(
                "📥 Remote change received:",
                fileId
            );

            const newContent = content || "";

            // Update React state
            setFiles((prev) => ({
                ...prev,
                [currentFile]: newContent,
            }));

            // Update Monaco directly
            if (editorRef.current) {
                isApplyingRemoteChange.current = true;

                editorRef.current.setValue(
                    newContent
                );

                setTimeout(() => {
                    isApplyingRemoteChange.current = false;
                }, 0);
            }
        };

        socket.on(
            "file-change",
            handleFileChange
        );

        return () => {
            socket.off(
                "file-change",
                handleFileChange
            );
        };
    }, []);


    /*
     * Load updated settings when the Settings Page
     * changes them.
     */
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings =
                    localStorage.getItem(
                        "codeSyncSettings"
                    );

                if (savedSettings) {
                    setEditorSettings({
                        ...DEFAULT_EDITOR_SETTINGS,
                        ...JSON.parse(savedSettings),
                    });
                }
            } catch (error) {
                console.error(
                    "Failed to update editor settings:",
                    error
                );
            }
        };

        window.addEventListener(
            "codeSyncSettingsChanged",
            loadSettings
        );

        return () => {
            window.removeEventListener(
                "codeSyncSettingsChanged",
                loadSettings
            );
        };
    }, []);


    const findFile = (tree, fileName) => {
        for (const node of tree) {
            if (
                node.type === "file" &&
                node.name === fileName
            ) {
                return node;
            }

            if (node.children) {
                const found = findFile(
                    node.children,
                    fileName
                );

                if (found) {
                    return found;
                }
            }
        }

        return null;
    };


    const saveFile = async (
        content,
        showToast = false
    ) => {
        const currentFile =
            activeFileRef.current;

        const currentExplorer =
            explorerRef.current;

        if (!currentFile) return false;

        const file = findFile(
            currentExplorer,
            currentFile
        );

        if (!file) {
            console.error(
                "File not found:",
                currentFile
            );

            return false;
        }

        /*
         * Save to IndexedDB first.
         * This makes the editor offline-first.
         */

        try {
            const existingFile =
                await getFileById(file.id);

            await saveFileToIndexedDB({
                ...(existingFile || {}),
                id: file.id,
                name: file.name,
                content: content || "",
            });

            console.log(
                "File saved to IndexedDB:",
                currentFile
            );

        } catch (offlineSaveError) {

            console.error(
                "IndexedDB save failed:",
                offlineSaveError
            );

            toast.error(
                "Local save failed"
            );

            return false;
        }


        /*
         * Helper to queue or update an UPDATE_FILE operation in IndexedDB.
         * Limited to the same file to prevent duplicate operations.
         */
        const queueOfflineUpdate = async () => {
            try {
                const operations = await getOperations();
                const existingOp = operations.find(
                    (op) =>
                        op.type === "UPDATE_FILE" &&
                        op.entityId === file.id
                );

                if (existingOp) {
                    await updateOperation({
                        ...existingOp,
                        data: {
                            ...existingOp.data,
                            content: content || "",
                            name: file.name,
                        },
                        updatedAt: new Date().toISOString(),
                    });

                    console.log(
                        "Updated existing UPDATE_FILE operation in queue:",
                        file.id
                    );
                } else {
                    await addOperation({
                        type: "UPDATE_FILE",
                        entityId: file.id,
                        projectId: file.projectId || projectId,
                        data: {
                            content: content || "",
                            name: file.name,
                        },
                    });

                    console.log(
                        "Queued new UPDATE_FILE operation:",
                        file.id
                    );
                }
            } catch (opError) {
                console.error(
                    "Failed to queue UPDATE_FILE operation:",
                    opError
                );
            }
        };

        /*
         * If offline, queue UPDATE_FILE without sending
         * an unnecessary failed backend request.
         */
        if (!navigator.onLine) {
            await queueOfflineUpdate();

            setDirtyFiles((prev) =>
                prev.filter(
                    (name) =>
                        name !== currentFile
                )
            );

            setSaveStatus(
                "Saved Locally"
            );

            if (showToast) {
                toast.success(
                    "Saved locally"
                );
            }

            return true;
        }

        /*
         * Try saving to backend.
         */

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        content,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Backend save failed"
                );
            }

            /*
             * Backend + IndexedDB saved
             */

            try {
                const operations = await getOperations();
                const pendingOp = operations.find(
                    (op) =>
                        op.type === "UPDATE_FILE" &&
                        op.entityId === file.id
                );

                if (pendingOp) {
                    await deleteOperation(pendingOp.id);
                }
            } catch (cleanupError) {
                console.warn(
                    "Failed to clean up pending operation:",
                    cleanupError
                );
            }

            setDirtyFiles((prev) =>
                prev.filter(
                    (name) =>
                        name !== currentFile
                )
            );

            setSaveStatus("Saved");

            if (showToast) {
                toast.success("Saved");
            }

            return true;

        } catch (error) {

            /*
             * Backend unavailable.
             * Queue UPDATE_FILE operation and save locally.
             */

            console.warn(
                "Backend unavailable. File saved locally."
            );

            await queueOfflineUpdate();

            setDirtyFiles((prev) =>
                prev.filter(
                    (name) =>
                        name !== currentFile
                )
            );

            setSaveStatus(
                "Saved Locally"
            );

            if (showToast) {
                toast.success(
                    "Saved locally"
                );
            }

            return true;
        }
    };


    /* Ctrl + S */

    // useEffect(() => {
    //     const handleSave = async (e) => {
    //         if (
    //             !(
    //                 e.ctrlKey &&
    //                 e.key.toLowerCase() === "s"
    //             )
    //         ) {
    //             return;
    //         }

    //         e.preventDefault();

    //         const currentFile =
    //             activeFileRef.current;

    //         const content =
    //             filesRef.current[currentFile] ||
    //             "";

    //         await saveFile(
    //             content,
    //             true
    //         );
    //     };

    //     window.addEventListener(
    //         "keydown",
    //         handleSave
    //     );

    //     return () => {
    //         window.removeEventListener(
    //             "keydown",
    //             handleSave
    //         );
    //     };
    // }, []);


    /* Clear Auto Save Timer */

    useEffect(() => {
        return () => {
            clearTimeout(
                timer.current
            );
        };
    }, []);


    if (!activeFile) {
        return (
            <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-slate-400">
                Select a file to start editing
            </div>
        );
    }


    return (
        <Editor
            height="100%"

            /*
             * Theme
             */
            theme={
                editorSettings.theme === "light"
                    ? "vs-light"
                    : "vs-dark"
            }

            defaultLanguage="javascript"

            path={activeFile}

            value={
                files[activeFile] || ""
            }

            /*
             * Monaco settings
             */
            options={{
                fontSize:
                    editorSettings.fontSize,

                wordWrap:
                    editorSettings.wordWrap
                        ? "on"
                        : "off",

                minimap: {
                    enabled:
                        editorSettings.minimap,
                },

                automaticLayout: true,

                scrollBeyondLastLine:
                    false,
            }}

            onMount={(editor, monaco) => {
                editorRef.current = editor;

                setEditorInstance(editor);

                editor.addCommand(
                    monaco.KeyMod.CtrlCmd |
                    monaco.KeyCode.KeyS,
                    async () => {
                        const currentFile =
                            activeFileRef.current;

                        const content =
                            filesRef.current[currentFile] || "";

                        await saveFile(
                            content,
                            true
                        );
                    }
                );
            }}

            onChange={(value = "") => {
                if (isApplyingRemoteChange.current) {
                    return;
                }

                const currentFile =
                    activeFileRef.current;

                const currentExplorer =
                    explorerRef.current;

                setFiles((prev) => ({
                    ...prev,
                    [activeFile]: value,
                }));

                // Send change to other collaborators
                const socket =
                    getCollaborationSocket();

                const file = findFile(
                    currentExplorer,
                    currentFile
                );

                if (
                    socket?.connected &&
                    file?.id
                ) {

                    console.log("📤 SENDING:", {
                        projectId,
                        fileId: file.id,
                        content: value,
                    });
                    
                    socket.emit(
                        "file-change",
                        {
                            projectId,
                            fileId: file.id,
                            content: value,
                        }
                    );
                }

                if (
                    !dirtyFiles.includes(
                        activeFile
                    )
                ) {
                    setDirtyFiles((prev) => [
                        ...prev,
                        activeFile,
                    ]);
                }

                setSaveStatus(
                    "Unsaved"
                );

                clearTimeout(
                    timer.current
                );

                timer.current = setTimeout(
                    async () => {
                        const currentFile =
                            activeFileRef.current;

                        const currentContent =
                            filesRef.current[
                            currentFile
                            ] || "";

                        const saved =
                            await saveFile(
                                currentContent,
                                false
                            );

                        if (saved) {
                            toast.success(
                                "Auto Saved"
                            );
                        }
                    },
                    2000
                );
            }}
        />
    );
}

export default CodeEditor;