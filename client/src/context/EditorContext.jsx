import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    getFileById,
    getFolderById,
    getFoldersByProject,
    getFilesByProject,
    saveFile as saveFileToIndexedDB,
    deleteFile as deleteFileFromIndexedDB,
    saveFolder as saveFolderToIndexedDB,
    deleteFolder as deleteFolderFromIndexedDB,
    addOperation,
} from "../database/indexedDB";

const EditorContext = createContext();

export function EditorProvider({ children }) {
    const [activeFile, setActiveFile] = useState("");
    const [editorInstance, setEditorInstance] = useState(null);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [openTabs, setOpenTabs] = useState([]);
    const [explorer, setExplorer] = useState([]);

    const [files, setFiles] = useState({});
    const [dirtyFiles, setDirtyFiles] = useState([]);

    const openFile = async (file) => {
        if (!file) return;

        // Already loaded
        if (files[file.name] !== undefined) {
            if (!openTabs.includes(file.name)) {
                setOpenTabs((prev) => [
                    ...prev,
                    file.name,
                ]);
            }

            setActiveFile(file.name);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/single/${file.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Server unavailable");
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error("Unable to open file");
            }

            setFiles((prev) => ({
                ...prev,
                [data.file.name]:
                    data.file.content || "",
            }));

            setOpenTabs((prev) =>
                prev.includes(data.file.name)
                    ? prev
                    : [...prev, data.file.name]
            );

            setActiveFile(data.file.name);

        } catch (error) {

            console.warn(
                "Backend unavailable. Loading file from IndexedDB..."
            );

            try {
                const localFile =
                    await getFileById(file.id);

                if (!localFile) {
                    toast.error(
                        "File not available offline"
                    );
                    return;
                }

                setFiles((prev) => ({
                    ...prev,
                    [localFile.name]:
                        localFile.content || "",
                }));

                setOpenTabs((prev) =>
                    prev.includes(localFile.name)
                        ? prev
                        : [...prev, localFile.name]
                );

                setActiveFile(localFile.name);

                toast.success(
                    "Opened from offline storage"
                );

            } catch (offlineError) {
                console.error(
                    "Offline file loading failed:",
                    offlineError
                );

                toast.error(
                    "Unable to open file"
                );
            }
        }
    };

    const addNode = (tree, parentName, newNode) => {
        return tree.map((node) => {
            if (node.name === parentName && node.type === "folder") {
                return {
                    ...node,
                    children: [...node.children, newNode],
                };
            }

            if (node.children) {
                return {
                    ...node,
                    children: addNode(node.children, parentName, newNode),
                };
            }

            return node;
        });
    };

    const deleteNode = (tree, nodeName) => {
        return tree
            .filter((node) => node.name !== nodeName)
            .map((node) => ({
                ...node,
                children: node.children
                    ? deleteNode(node.children, nodeName)
                    : [],
            }));
    };

    const renameNode = (tree, oldName, newName) => {
        return tree.map((node) => {
            if (node.name === oldName) {
                return {
                    ...node,
                    name: newName,
                };
            }

            return {
                ...node,
                children: node.children
                    ? renameNode(node.children, oldName, newName)
                    : [],
            };
        });
    };

    const createNewFile = async (folder) => {
        const fileName = prompt("Enter file name:");

        if (!fileName) return;

        const projectId =
            window.location.pathname.split("/").pop();

        const folderId =
            folder?.type === "folder" &&
                folder.id !== "root"
                ? folder.id
                : null;

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/files",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: fileName,
                        language: "javascript",
                        projectId,
                        folderId,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to create file"
                );
            }

            const newFile = {
                id: data.file._id,
                name: data.file.name,
                type: "file",
            };

            // Save locally too
            await saveFileToIndexedDB({
                id: data.file._id,
                name: data.file.name,
                content: "",
                language:
                    data.file.language ||
                    "javascript",
                projectId:
                    data.file.project ||
                    projectId,
                folderId:
                    data.file.folder ||
                    folderId,
                createdAt:
                    data.file.createdAt ||
                    new Date().toISOString(),
                updatedAt:
                    data.file.updatedAt ||
                    new Date().toISOString(),
            });

            setFiles((prev) => ({
                ...prev,
                [fileName]: "",
            }));

            setExplorer((prev) => {
                const addFile = (nodes) =>
                    nodes.map((node) => {
                        if (
                            node.id ===
                            (folder?.id || "root")
                        ) {
                            return {
                                ...node,
                                children: [
                                    ...(node.children || []),
                                    newFile,
                                ],
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    addFile(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });

                return addFile(prev);
            });

            setOpenTabs((prev) =>
                prev.includes(fileName)
                    ? prev
                    : [...prev, fileName]
            );

            setActiveFile(fileName);

            toast.success("File created");

        } catch (error) {

            console.warn(
                "Backend unavailable. Creating file offline."
            );

            const localId =
                `local-file-${Date.now()}`;

            const newFile = {
                id: localId,
                name: fileName,
                type: "file",
            };

            // Save file locally
            await saveFileToIndexedDB({
                id: localId,
                name: fileName,
                content: "",
                language: "javascript",
                projectId,
                folderId,
                createdAt:
                    new Date().toISOString(),
                updatedAt:
                    new Date().toISOString(),
            });

            // Add operation to sync queue
            await addOperation({
                type: "CREATE_FILE",
                entityId: localId,
                projectId,
                folderId,
                data: {
                    name: fileName,
                    language: "javascript",
                    content: "",
                },
            });

            setFiles((prev) => ({
                ...prev,
                [fileName]: "",
            }));

            setExplorer((prev) => {
                const addFile = (nodes) =>
                    nodes.map((node) => {
                        if (
                            node.id ===
                            (folder?.id || "root")
                        ) {
                            return {
                                ...node,
                                children: [
                                    ...(node.children || []),
                                    newFile,
                                ],
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    addFile(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });

                return addFile(prev);
            });

            setOpenTabs((prev) =>
                prev.includes(fileName)
                    ? prev
                    : [...prev, fileName]
            );

            setActiveFile(fileName);

            toast.success(
                "File created offline"
            );
        }
    };

    const removeFileFromUI = (fileName) => {
        setFiles((prev) => {
            const updated = { ...prev };

            delete updated[fileName];

            return updated;
        });

        setExplorer((prev) =>
            deleteNode(prev, fileName)
        );

        setOpenTabs((prev) =>
            prev.filter(
                (tab) => tab !== fileName
            )
        );

        setDirtyFiles((prev) =>
            prev.filter(
                (file) => file !== fileName
            )
        );

        if (activeFile === fileName) {
            setActiveFile("");
        }
    };

    const deleteFile = async (fileName) => {
        const projectFolder = explorer[0];

        if (!projectFolder) return;

        const findFile = (nodes) => {
            for (const node of nodes) {
                if (
                    node.type === "file" &&
                    node.name === fileName
                ) {
                    return node;
                }

                if (node.children) {
                    const found =
                        findFile(node.children);

                    if (found) return found;
                }
            }

            return null;
        };

        const file =
            findFile(explorer);

        if (!file) return;

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Delete failed"
                );
            }

            await deleteFileFromIndexedDB(
                file.id
            );

            await removeFileFromUI(
                fileName
            );

            toast.success("File deleted");

        } catch (error) {

            console.warn(
                "Backend unavailable. Deleting file offline."
            );

            await deleteFileFromIndexedDB(
                file.id
            );

            await addOperation({
                type: "DELETE_FILE",
                entityId: file.id,
                data: {
                    name: fileName,
                },
            });

            await removeFileFromUI(
                fileName
            );

            toast.success(
                "File deleted offline"
            );
        }
    };

    const updateFileNameInUI = (
        oldName,
        newName
    ) => {
        setFiles((prev) => {
            const updated = {
                ...prev,
            };

            updated[newName] =
                updated[oldName];

            delete updated[oldName];

            return updated;
        });

        setExplorer((prev) =>
            renameNode(
                prev,
                oldName,
                newName
            )
        );

        setOpenTabs((prev) =>
            prev.map((tab) =>
                tab === oldName
                    ? newName
                    : tab
            )
        );

        setDirtyFiles((prev) =>
            prev.map((file) =>
                file === oldName
                    ? newName
                    : file
            )
        );

        if (activeFile === oldName) {
            setActiveFile(newName);
        }
    };

    const renameFile = async (
        oldName,
        newName
    ) => {
        if (
            !newName ||
            oldName === newName
        ) {
            return;
        }

        const findFile = (nodes) => {
            for (const node of nodes) {
                if (
                    node.type === "file" &&
                    node.name === oldName
                ) {
                    return node;
                }

                if (node.children) {
                    const found =
                        findFile(node.children);

                    if (found) return found;
                }
            }

            return null;
        };

        const file =
            findFile(explorer);

        if (!file) return;

        const allFiles = [];

        const collectFiles = (nodes) => {
            nodes.forEach((node) => {
                if (node.type === "file") {
                    allFiles.push(node);
                }

                if (node.children) {
                    collectFiles(node.children);
                }
            });
        };

        collectFiles(explorer);

        if (
            allFiles.some(
                (f) => f.name === newName
            )
        ) {
            toast.error(
                "A file with this name already exists!"
            );
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newName,
                    }),
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Rename failed"
                );
            }

            const localFile =
                await getFileById(file.id);

            if (localFile) {
                await saveFileToIndexedDB({
                    ...localFile,
                    name: newName,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            updateFileNameInUI(
                oldName,
                newName
            );

            toast.success("File renamed");

        } catch (error) {

            console.warn(
                "Backend unavailable. Renaming file offline."
            );

            const localFile =
                await getFileById(file.id);

            if (localFile) {
                await saveFileToIndexedDB({
                    ...localFile,
                    name: newName,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            await addOperation({
                type: "RENAME_FILE",
                entityId: file.id,
                data: {
                    oldName,
                    newName,
                },
            });

            updateFileNameInUI(
                oldName,
                newName
            );

            toast.success(
                "File renamed offline"
            );
        }
    };

    const createNewFolder = async (folder) => {
        const folderName = prompt("Folder name");

        if (!folderName) return;

        const projectId =
            window.location.pathname.split("/").pop();

        const parent =
            folder?.type === "folder" &&
                folder.id !== "root"
                ? folder.id
                : null;

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/folders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: folderName,
                        projectId,
                        parent,
                    }),
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to create folder"
                );
            }

            const newFolder = {
                id: data.folder._id,
                name: data.folder.name,
                type: "folder",
                children: [],
            };

            // Save locally too
            await saveFolderToIndexedDB({
                id: data.folder._id,
                name: data.folder.name,
                projectId:
                    data.folder.project ||
                    projectId,
                parentId:
                    data.folder.parent ||
                    parent,
                createdAt:
                    data.folder.createdAt ||
                    new Date().toISOString(),
                updatedAt:
                    data.folder.updatedAt ||
                    new Date().toISOString(),
            });

            setExplorer((prev) => {
                const addFolder = (nodes) => {
                    return nodes.map((node) => {

                        if (
                            node.id ===
                            (folder?.id || "root")
                        ) {
                            return {
                                ...node,
                                children: [
                                    ...(node.children || []),
                                    newFolder,
                                ],
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    addFolder(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });
                };

                return addFolder(prev);
            });

            toast.success("Folder created");

        } catch (error) {

            console.warn(
                "Backend unavailable. Creating folder offline."
            );

            const localId =
                `local-folder-${Date.now()}`;

            const newFolder = {
                id: localId,
                name: folderName,
                type: "folder",
                children: [],
            };

            await saveFolderToIndexedDB({
                id: localId,
                name: folderName,
                projectId,
                parentId: parent,
                createdAt:
                    new Date().toISOString(),
                updatedAt:
                    new Date().toISOString(),
            });

            await addOperation({
                type: "CREATE_FOLDER",
                entityId: localId,
                projectId,
                parentId: parent,
                data: {
                    name: folderName,
                },
            });

            setExplorer((prev) => {
                const addFolder = (nodes) => {
                    return nodes.map((node) => {

                        if (
                            node.id ===
                            (folder?.id || "root")
                        ) {
                            return {
                                ...node,
                                children: [
                                    ...(node.children || []),
                                    newFolder,
                                ],
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    addFolder(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });
                };

                return addFolder(prev);
            });

            toast.success(
                "Folder created offline"
            );
        }
    };

    const renameFolder = async (
        folder,
        newName
    ) => {
        if (
            !folder ||
            !newName ||
            folder.name === newName
        ) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/folders/${folder.id}/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newName,
                    }),
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Rename failed"
                );
            }

            const localFolder =
                await getFolderById(folder.id);

            if (localFolder) {
                await saveFolderToIndexedDB({
                    ...localFolder,
                    name: newName,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            setExplorer((prev) => {
                const renameFolderNode = (
                    nodes
                ) =>
                    nodes.map((node) => {

                        if (
                            node.id ===
                            folder.id
                        ) {
                            return {
                                ...node,
                                name: newName,
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    renameFolderNode(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });

                return renameFolderNode(prev);
            });

            toast.success("Folder renamed");

        } catch (error) {

            console.warn(
                "Backend unavailable. Renaming folder offline."
            );

            const localFolder =
                await getFolderById(folder.id);

            if (localFolder) {
                await saveFolderToIndexedDB({
                    ...localFolder,
                    name: newName,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            await addOperation({
                type: "RENAME_FOLDER",
                entityId: folder.id,
                data: {
                    oldName: folder.name,
                    newName,
                },
            });

            setExplorer((prev) => {
                const renameFolderNode = (
                    nodes
                ) =>
                    nodes.map((node) => {

                        if (
                            node.id ===
                            folder.id
                        ) {
                            return {
                                ...node,
                                name: newName,
                            };
                        }

                        if (node.children) {
                            return {
                                ...node,
                                children:
                                    renameFolderNode(
                                        node.children
                                    ),
                            };
                        }

                        return node;
                    });

                return renameFolderNode(prev);
            });

            toast.success(
                "Folder renamed offline"
            );
        }
    };

    const removeFolderFromUI = (folder) => {

        const collectFiles = (node) => {
            let names = [];

            if (node.type === "file") {
                names.push(node.name);
            }

            if (node.children) {
                node.children.forEach((child) => {
                    names = [
                        ...names,
                        ...collectFiles(child),
                    ];
                });
            }

            return names;
        };

        const deletedFileNames =
            collectFiles(folder);

        setFiles((prev) => {
            const updated = { ...prev };

            deletedFileNames.forEach((name) => {
                delete updated[name];
            });

            return updated;
        });

        setOpenTabs((prev) =>
            prev.filter(
                (tab) =>
                    !deletedFileNames.includes(tab)
            )
        );

        setDirtyFiles((prev) =>
            prev.filter(
                (file) =>
                    !deletedFileNames.includes(file)
            )
        );

        if (
            deletedFileNames.includes(activeFile)
        ) {
            setActiveFile("");
        }

        const removeFolder = (nodes) =>
            nodes
                .filter(
                    (node) =>
                        node.id !== folder.id
                )
                .map((node) => ({
                    ...node,
                    children: node.children
                        ? removeFolder(
                            node.children
                        )
                        : [],
                }));

        setExplorer((prev) =>
            removeFolder(prev)
        );
    };


    const deleteFolder = async (folder) => {
        if (!folder) return;

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/folders/${folder.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Delete failed"
                );
            }

            // Remove folder locally
            await deleteFolderFromIndexedDB(
                folder.id
            );

            // Remove children from local storage
            const removeLocalChildren = async (
                nodes
            ) => {
                for (const node of nodes) {
                    if (node.type === "file") {
                        await deleteFileFromIndexedDB(
                            node.id
                        );
                    }

                    if (
                        node.type === "folder" &&
                        node.id !== folder.id
                    ) {
                        await deleteFolderFromIndexedDB(
                            node.id
                        );
                    }

                    if (node.children) {
                        await removeLocalChildren(
                            node.children
                        );
                    }
                }
            };

            await removeLocalChildren(
                folder.children || []
            );

            removeFolderFromUI(folder);

            toast.success("Folder deleted");

        } catch (error) {

            console.warn(
                "Backend unavailable. Deleting folder offline."
            );

            try {
                const projectId =
                    window.location.pathname
                        .split("/")
                        .pop();

                // Get all local folders
                const localFolders =
                    await getFoldersByProject(
                        projectId
                    );

                // Get all local files
                const localFiles =
                    await getFilesByProject(
                        projectId
                    );

                // Find every folder inside the
                // deleted folder recursively
                const folderIdsToDelete = new Set([
                    folder.id,
                ]);

                let foundNewFolder = true;

                while (foundNewFolder) {
                    foundNewFolder = false;

                    for (const localFolder of localFolders) {

                        if (
                            localFolder.parentId &&
                            folderIdsToDelete.has(
                                localFolder.parentId
                            ) &&
                            !folderIdsToDelete.has(
                                localFolder.id
                            )
                        ) {
                            folderIdsToDelete.add(
                                localFolder.id
                            );

                            foundNewFolder = true;
                        }
                    }
                }

                // Delete all folders
                for (
                    const folderId
                    of folderIdsToDelete
                ) {
                    await deleteFolderFromIndexedDB(
                        folderId
                    );
                }

                // Delete files belonging to
                // deleted folders
                for (const file of localFiles) {

                    if (
                        file.folderId &&
                        folderIdsToDelete.has(
                            file.folderId
                        )
                    ) {
                        await deleteFileFromIndexedDB(
                            file.id
                        );
                    }
                }

                // Record operation for future sync
                await addOperation({
                    type: "DELETE_FOLDER",
                    entityId: folder.id,
                    projectId,
                    data: {
                        name: folder.name,
                    },
                });

                // Update UI
                removeFolderFromUI(folder);

                toast.success(
                    "Folder deleted offline"
                );

            } catch (offlineDeleteError) {

                console.error(
                    "Offline folder deletion failed:",
                    offlineDeleteError
                );

                toast.error(
                    "Unable to delete folder offline"
                );
            }
        }
    };

    const moveFileInExplorer = (
        file,
        targetFolder
    ) => {

        const removeFileFromTree = (
            nodes
        ) => {
            return nodes.map((node) => ({
                ...node,
                children: node.children
                    ? node.children
                        .filter(
                            (child) =>
                                child.id !== file.id
                        )
                        .map((child) => ({
                            ...child,
                            children:
                                child.children
                                    ? removeFileFromTree(
                                        child.children
                                    )
                                    : [],
                        }))
                    : [],
            }));
        };

        let updatedExplorer =
            removeFileFromTree(explorer);

        const fileNode = {
            id: file.id,
            name: file.name,
            type: "file",
        };

        if (targetFolder.id === "root") {

            updatedExplorer =
                updatedExplorer.map((root) => ({
                    ...root,
                    children: [
                        ...(root.children || []),
                        fileNode,
                    ],
                }));

        } else {

            const addFileToFolder = (
                nodes
            ) => {
                return nodes.map((node) => {

                    if (
                        node.id ===
                        targetFolder.id
                    ) {
                        return {
                            ...node,
                            children: [
                                ...(node.children || []),
                                fileNode,
                            ],
                        };
                    }

                    if (node.children) {
                        return {
                            ...node,
                            children:
                                addFileToFolder(
                                    node.children
                                ),
                        };
                    }

                    return node;
                });
            };

            updatedExplorer =
                addFileToFolder(
                    updatedExplorer
                );
        }

        setExplorer(updatedExplorer);
    };

    const moveFile = async (
        file,
        targetFolder
    ) => {
        if (!file || !targetFolder) return;

        const folderId =
            targetFolder.id === "root"
                ? null
                : targetFolder.id;

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}/move`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        folderId,
                    }),
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Move failed"
                );
            }

            const localFile =
                await getFileById(file.id);

            if (localFile) {
                await saveFileToIndexedDB({
                    ...localFile,
                    folderId,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            moveFileInExplorer(
                file,
                targetFolder
            );

            toast.success("File moved");

        } catch (error) {

            console.warn(
                "Backend unavailable. Moving file offline."
            );

            const localFile =
                await getFileById(file.id);

            if (localFile) {
                await saveFileToIndexedDB({
                    ...localFile,
                    folderId,
                    updatedAt:
                        new Date().toISOString(),
                });
            }

            await addOperation({
                type: "MOVE_FILE",
                entityId: file.id,
                data: {
                    folderId,
                },
            });

            moveFileInExplorer(
                file,
                targetFolder
            );

            toast.success(
                "File moved offline"
            );
        }
    };

    return (
        <EditorContext.Provider
            value={{
                activeFile,
                setActiveFile,
                files,
                setFiles,
                openTabs,
                setOpenTabs,
                openFile,
                createNewFile,
                dirtyFiles,
                setDirtyFiles,
                saveStatus,
                setSaveStatus,
                explorer,
                setExplorer,
                deleteFile,
                renameFile,
                createNewFolder,
                renameFolder,
                deleteFolder,
                moveFile,
                editorInstance,
                setEditorInstance,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
}

export const useEditor = () => useContext(EditorContext);