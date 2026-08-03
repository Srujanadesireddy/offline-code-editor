import { useEditor } from "../../context/EditorContext";
function ContextMenu({ x, y, visible, item, onClose }) {
    const { createNewFile, deleteFile, renameFile, createNewFolder } = useEditor();

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

                    const newName = prompt("Enter new file name:", item.name);

                    if (!newName) return;

                    renameFile(item.name, newName);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700"
            >
                ✏ Rename
            </button>

            <button
                onClick={() => {
                    if (item) {
                        deleteFile(item.name);
                        onClose();
                    }
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700"
            >
                🗑 Delete
            </button>
        </div>
    );
}

export default ContextMenu;