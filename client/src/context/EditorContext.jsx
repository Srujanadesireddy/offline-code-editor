import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const EditorContext = createContext();

export function EditorProvider({ children }) {
    const [activeFile, setActiveFile] = useState("");
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
                setOpenTabs((prev) => [...prev, file.name]);
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

            const data = await response.json();

            if (!data.success) {
                toast.error("Unable to open file");
                return;
            }

            setFiles((prev) => ({
                ...prev,
                [data.file.name]: data.file.content || "",
            }));

            setOpenTabs((prev) =>
                prev.includes(data.file.name)
                    ? prev
                    : [...prev, data.file.name]
            );

            setActiveFile(data.file.name);

        } catch (err) {
            toast.error("Failed to load file");
            console.error(err);
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

        try {
            const token = localStorage.getItem("token");
            const projectId = window.location.pathname.split("/").pop();

            const folderId =
                folder?.type === "folder" && folder.id !== "root"
                    ? folder.id
                    : null;

            const response = await fetch(
                "http://localhost:5000/api/files",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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
                toast.error(data.message || "Failed to create file");
                return;
            }

            const newFile = {
                id: data.file._id,
                name: data.file.name,
                type: "file",
            };

            setFiles((prev) => ({
                ...prev,
                [data.file.name]: "",
            }));

            setExplorer((prev) => {

                const addFile = (nodes) =>
                    nodes.map((node) => {

                        if (node.id === (folder?.id || "root")) {
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
                                children: addFile(node.children),
                            };
                        }

                        return node;
                    });

                return addFile(prev);
            });

            setOpenTabs((prev) =>
                prev.includes(data.file.name)
                    ? prev
                    : [...prev, data.file.name]
            );

            setActiveFile(data.file.name);

            toast.success("File created");

        } catch (error) {
            console.error("Create file error:", error);
            toast.error("Server Error");
        }
    };

    const deleteFile = async (fileName) => {
        const projectFolder = explorer[0];

        if (!projectFolder) return;

        const file = projectFolder.children.find(
            (f) => f.name === fileName
        );

        if (!file) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Delete failed");
                return;
            }

            setFiles((prev) => {
                const updated = { ...prev };
                delete updated[fileName];
                return updated;
            });

            setExplorer((prev) =>
                deleteNode(prev, fileName)
            );

            setOpenTabs((prev) =>
                prev.filter((tab) => tab !== fileName)
            );

            if (activeFile === fileName) {
                setActiveFile("");
            }

            setDirtyFiles((prev) =>
                prev.filter((file) => file !== fileName)
            );

            toast.success("File deleted");

        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        }
    };

    const renameFile = async (oldName, newName) => {
        if (!newName || oldName === newName) return;

        const projectFolder = explorer[0];

        if (!projectFolder) return;

        const file = projectFolder.children.find(
            (f) => f.name === oldName
        );

        if (!file) return;

        if (projectFolder.children.some(
            (f) => f.name === newName
        )) {
            toast.error("A file with this name already exists!");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newName,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Rename failed");
                return;
            }

            setFiles((prev) => {
                const updated = { ...prev };

                updated[newName] = updated[oldName];

                delete updated[oldName];

                return updated;
            });

            setExplorer((prev) =>
                renameNode(prev, oldName, newName)
            );

            setOpenTabs((prev) =>
                prev.map((tab) =>
                    tab === oldName ? newName : tab
                )
            );

            if (activeFile === oldName) {
                setActiveFile(newName);
            }

            setDirtyFiles((prev) =>
                prev.map((file) =>
                    file === oldName ? newName : file
                )
            );

            toast.success("File renamed");

        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        }
    };
    const createNewFolder = async (folder) => {
        const folderName = prompt("Folder name");

        if (!folderName) return;

        try {
            const token = localStorage.getItem("token");

            // Get project ID from current editor URL
            const projectId = window.location.pathname.split("/").pop();

            // Parent folder ID
            const parent =
                folder?.type === "folder" && folder.id !== "root"
                    ? folder.id
                    : null;

            const response = await fetch(
                "http://localhost:5000/api/folders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: folderName,
                        projectId,
                        parent,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Failed to create folder");
                return;
            }

            const newFolder = {
                id: data.folder._id,
                name: data.folder.name,
                type: "folder",
                children: [],
            };

            setExplorer((prev) => {

                const addFolder = (nodes) => {
                    return nodes.map((node) => {

                        if (
                            folder &&
                            node.id === folder.id
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
                                children: addFolder(node.children),
                            };
                        }

                        return node;
                    });
                };

                // No parent → add to Project root
                if (!folder || folder.id === "root") {
                    return prev.map((root) => ({
                        ...root,
                        children: [
                            ...(root.children || []),
                            newFolder,
                        ],
                    }));
                }

                return addFolder(prev);
            });

            toast.success("Folder created");

        } catch (error) {
            console.error("Create folder error:", error);
            toast.error("Server Error");
        }
    };


    const renameFolder = async (folder, newName) => {
        if (!folder || !newName || folder.name === newName) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/folders/${folder.id}/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newName,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Rename failed");
                return;
            }

            const renameFolderNode = (nodes) =>
                nodes.map((node) => {
                    if (node.id === folder.id) {
                        return {
                            ...node,
                            name: newName,
                        };
                    }

                    if (node.children) {
                        return {
                            ...node,
                            children: renameFolderNode(
                                node.children
                            ),
                        };
                    }

                    return node;
                });

            setExplorer(renameFolderNode(explorer));

            toast.success("Folder renamed");

        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        }
    };


    const deleteFolder = async (folder) => {
        if (!folder) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/folders/${folder.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Delete failed");
                return;
            }

            const removeFolder = (nodes) =>
                nodes
                    .filter((node) => node.id !== folder.id)
                    .map((node) => ({
                        ...node,
                        children: node.children
                            ? removeFolder(node.children)
                            : [],
                    }));

            setExplorer(removeFolder(explorer));

            toast.success("Folder deleted");

        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        }
    };

    const moveFile = async (file, targetFolder) => {
        if (!file || !targetFolder) return;

        try {
            const token = localStorage.getItem("token");

            const folderId =
                targetFolder.id === "root"
                    ? null
                    : targetFolder.id;

            const response = await fetch(
                `http://localhost:5000/api/files/${file.id}/move`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        folderId,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Move failed");
                return;
            }

            // Remove file from EVERY location
            const removeFileFromTree = (nodes) => {
                return nodes.map((node) => ({
                    ...node,
                    children: node.children
                        ? node.children
                            .filter(
                                (child) => child.id !== file.id
                            )
                            .map((child) => ({
                                ...child,
                                children: child.children
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

            // Add file to destination
            const addFileToFolder = (nodes) => {
                return nodes.map((node) => {

                    if (node.id === targetFolder.id) {
                        return {
                            ...node,
                            children: [
                                ...(node.children || []),
                                {
                                    id: file.id,
                                    name: file.name,
                                    type: "file",
                                },
                            ],
                        };
                    }

                    if (node.children) {
                        return {
                            ...node,
                            children: addFileToFolder(
                                node.children
                            ),
                        };
                    }

                    return node;
                });
            };

            if (targetFolder.id === "root") {
                updatedExplorer = updatedExplorer.map(
                    (root) => ({
                        ...root,
                        children: [
                            ...(root.children || []),
                            {
                                id: file.id,
                                name: file.name,
                                type: "file",
                            },
                        ],
                    })
                );
            } else {
                updatedExplorer =
                    addFileToFolder(updatedExplorer);
            }

            setExplorer(updatedExplorer);

            toast.success("File moved");

        } catch (error) {
            console.error("Move file error:", error);
            toast.error("Server Error");
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
            }}
        >
            {children}
        </EditorContext.Provider>
    );
}

export const useEditor = () => useContext(EditorContext);