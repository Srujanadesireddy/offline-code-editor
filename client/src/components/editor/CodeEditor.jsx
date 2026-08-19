import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditor } from "../../context/EditorContext";
import toast from "react-hot-toast";

const DEFAULT_EDITOR_SETTINGS = {
    theme: "dark",
    fontSize: 14,
    wordWrap: true,
    minimap: true,
};

function CodeEditor() {
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

    const activeFileRef = useRef(activeFile);
    const filesRef = useRef(files);
    const explorerRef = useRef(explorer);

    useEffect(() => {
        activeFileRef.current = activeFile;
        filesRef.current = files;
        explorerRef.current = explorer;
    }, [activeFile, files, explorer]);


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
                console.error(
                    "Save failed:",
                    data
                );

                toast.error(
                    data.message ||
                    "Save failed"
                );

                return false;
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
            console.error(
                "Save error:",
                error
            );

            toast.error(
                "Unable to save file"
            );

            return false;
        }
    };


    /* Ctrl + S */

    useEffect(() => {
        const handleSave = async (e) => {
            if (
                !(
                    e.ctrlKey &&
                    e.key.toLowerCase() === "s"
                )
            ) {
                return;
            }

            e.preventDefault();

            const currentFile =
                activeFileRef.current;

            const content =
                filesRef.current[currentFile] ||
                "";

            await saveFile(
                content,
                true
            );
        };

        window.addEventListener(
            "keydown",
            handleSave
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleSave
            );
        };
    }, []);


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

            onMount={(editor) => {
                setEditorInstance(editor);
            }}

            onChange={(value = "") => {
                setFiles((prev) => ({
                    ...prev,
                    [activeFile]: value,
                }));

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