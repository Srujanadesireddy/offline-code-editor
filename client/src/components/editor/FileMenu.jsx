import { useEditor } from "../../context/EditorContext";
function FileMenu({ isOpen }) {
    const { createNewFile } = useEditor();
    if (!isOpen) return null;

    return (
        <div className="absolute top-12 left-0 w-52 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">
            <div
    onClick={createNewFile}
    className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer transition-colors"
>
    📄 New File
</div>

            <div className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer transition-colors">
                📁 New Folder
            </div>

            <div className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer transition-colors">
                💾 Save
            </div>

            <div className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer transition-colors">
                💾 Save As
            </div>

            <div className="px-4 py-2 text-red-400 hover:bg-slate-700 cursor-pointer transition-colors">
                ✖ Close
            </div>
        </div>
    );
}

export default FileMenu;