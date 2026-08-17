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

        const projectId = window.location.pathname.split("/").pop();

        const token = localStorage.getItem("token");

        try {

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
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message);
                return;
            }

            setFiles((prev) => ({
                ...prev,
                [data.file.name]: "",
            }));

            setExplorer((prev) => [
                {
                    ...prev[0],
                    children: [
                        ...prev[0].children,
                        {
                            id: data.file._id,
                            name: data.file.name,
                            type: "file",
                        },
                    ],
                },
            ]);

            setOpenTabs((prev) => [
                ...prev,
                data.file.name,
            ]);

            setActiveFile(data.file.name);

            toast.success("File created");

        } catch (err) {
            console.log(err);
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
    const createNewFolder = (folder) => {
        const folderName = prompt("Folder name");

        if (!folderName) return;

        setExplorer((prev) =>
            addNode(
                prev,
                folder?.type === "folder"
                    ? folder.name
                    : "src",
                {
                    id: crypto.randomUUID(),
                    name: folderName,
                    type: "folder",
                    children: [],
                })
        );
        toast.success("Folder created successfully");
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
            }}
        >
            {children}
        </EditorContext.Provider>
    );
}

export const useEditor = () => useContext(EditorContext);