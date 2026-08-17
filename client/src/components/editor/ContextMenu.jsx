import { useEditor } from "../../context/EditorContext";
import toast from "react-hot-toast";

function ContextMenu({ x, y, visible, item, onClose }) {
    const { createNewFile, deleteFile, renameFile, createNewFolder, renameFolder, deleteFolder, moveFile, explorer, } = useEditor();

    if (!visible) return null;

    return (
        <div
            className="fixed bg-[#252526] border border-slate-700 rounded-md shadow-xl w-48 z-[9999] text-white"
            style={{ top: y, left: x }}
        >
            <button
                onClick={() => {
                    createNewFile(item);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700"
            >
                📄 New File
            </button>

            <button
                onClick={() => {
                    createNewFolder(item);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700"
            >
                📁 New Folder
            </button>

            <button
                onClick={() => {
                    if (!item) return;

                    const newName = prompt(
                        "Enter new name:",
                        item.name
                    );

                    if (!newName) return;

                    if (item.type === "folder") {
                        renameFolder(item, newName);
                    } else {
                        renameFile(item.name, newName);
                    }

                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700"
            >
                ✏ Rename
            </button>

            <button
                onClick={() => {
                    if (!item || item.type !== "file") return;

                    const folderName = prompt(
                        "Enter destination folder name:"
                    );

                    if (!folderName) return;

                    const findFolder = (nodes) => {
                        for (const node of nodes) {
                            if (
                                node.type === "folder" &&
                                node.name === folderName
                            ) {
                                return node;
                            }

                            if (node.children) {
                                const found = findFolder(node.children);

                                if (found) return found;
                            }
                        }

                        return null;
                    };

                    const targetFolder = findFolder(explorer);

                    if (!targetFolder) {
                        toast.error("Folder not found");
                        return;
                    }

                    moveFile(item, targetFolder);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700"
            >
                📂 Move to Folder
            </button>

            <button
                onClick={() => {
                    if (!item) return;

                    const confirmed = window.confirm(
                        `Delete "${item.name}"?`
                    );

                    if (!confirmed) return;

                    if (item.type === "folder") {
                        deleteFolder(item);
                    } else {
                        deleteFile(item.name);
                    }

                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700"
            >
                🗑 Delete
            </button>

        </div>
    );
}

export default ContextMenu;