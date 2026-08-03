import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const EditorContext = createContext();

const initialExplorer = [
    {
        id: "src",
        name: "src",
        type: "folder",
        children: [
            {
                id: "app",
                name: "App.jsx",
                type: "file",
            },
            {
                id: "main",
                name: "main.jsx",
                type: "file",
            },
            {
                id: "css",
                name: "index.css",
                type: "file",
            },
        ],
    },
    {
        id: "public",
        name: "public",
        type: "folder",
        children: [
            {
                id: "vite",
                name: "vite.svg",
                type: "file",
            },
        ],
    },
];

export function EditorProvider({ children }) {
    const [activeFile, setActiveFile] = useState("App.jsx");
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [openTabs, setOpenTabs] = useState(["App.jsx"]);
    const [explorer, setExplorer] = useState(() => {
        const saved = localStorage.getItem("explorer");

        return saved ? JSON.parse(saved) : initialExplorer;
    });

    useEffect(() => {
        localStorage.setItem(
            "explorer",
            JSON.stringify(explorer)
        );
    }, [explorer]);
    const [files, setFiles] = useState({
        "App.jsx": `function App() {
  return <h1>App Component</h1>;
}`,
        "main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";`,
        "index.css": `body {
  margin: 0;
}`,
    });
    const [dirtyFiles, setDirtyFiles] = useState([]);

    const openFile = (fileName) => {
        if (!openTabs.includes(fileName)) {
            setOpenTabs((prev) => [...prev, fileName]);
        }

        setActiveFile(fileName);
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

    const createNewFile = (folder) => {
        const fileName = prompt("Enter file name:");

        if (!fileName) return;

        if (files[fileName]) {
            toast.error("File already exists!");
            return;
        }

        setFiles((prev) => ({
            ...prev,
            [fileName]: "",
        }));

        setExplorer((prev) =>
            addNode(
                prev,
                folder?.type === "folder"
                    ? folder.name
                    : "src",
                {
                    id: crypto.randomUUID(),
                    name: fileName,
                    type: "file",
                })
        );

        setOpenTabs((prev) => [...prev, fileName]);

        setActiveFile(fileName);

        toast.success("File created successfully");
    };

    const deleteFile = (fileName) => {
        // Remove from files
        setFiles((prev) => {
            const updated = { ...prev };
            delete updated[fileName];
            return updated;
        });

        // Remove from explorer
        setExplorer((prev) =>
            deleteNode(prev, fileName)
        );

        // Remove from tabs
        setOpenTabs((prev) =>
            prev.filter((tab) => tab !== fileName)
        );

        // If deleted file was active, switch to App.jsx
        if (activeFile === fileName) {
            setActiveFile("App.jsx");
        }
        toast.success("Deleted successfully");
    };

    const renameFile = (oldName, newName) => {
        if (!newName || oldName === newName) return;

        // Prevent duplicate names
        if (files[newName]) {
            toast.error("A file with this name already exists!");
            return;
        }

        // Rename in files
        setFiles((prev) => {
            const updated = { ...prev };
            updated[newName] = updated[oldName];
            delete updated[oldName];
            return updated;
        });

        // Rename in explorer
        setExplorer((prev) =>
            renameNode(prev, oldName, newName)
        );

        // Rename in open tabs
        setOpenTabs((prev) =>
            prev.map((tab) => (tab === oldName ? newName : tab))
        );

        // Update active file
        if (activeFile === oldName) {
            setActiveFile(newName);
        }

        toast.success("Renamed successfully");
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