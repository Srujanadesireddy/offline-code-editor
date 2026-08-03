import { useEditor } from "../../context/EditorContext";
import { X } from "lucide-react";

function EditorTabs() {
    const {
        activeFile,
        setActiveFile,
        openTabs,
        setOpenTabs,
        dirtyFiles,
    } = useEditor();

    const closeTab = (file) => {
        const updated = openTabs.filter((tab) => tab !== file);

        setOpenTabs(updated);

        if (activeFile === file && updated.length > 0) {
            setActiveFile(updated[0]);
        }
    };

    return (
        <div className="h-10 bg-[#1e1e1e] border-b border-slate-700 flex">

            {openTabs.map((tab) => (
                <div
                    key={tab}
                    onClick={() => setActiveFile(tab)}
                    className={`flex items-center gap-2 px-4 cursor-pointer border-r border-slate-700 transition-colors ${activeFile === tab
                        ? "bg-[#252526] text-white"
                        : "bg-[#1e1e1e] text-slate-300 hover:bg-[#2d2d2d] hover:text-white"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {dirtyFiles.includes(tab) && (
                            <span className="text-blue-400 text-lg leading-none">●</span>
                        )}

                        <span className="text-sm text-white">{tab}</span>
                    </div>

                    <X
                        size={14}
                        className="text-slate-400 hover:text-red-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab);
                        }}

                    />
                </div>
            ))}

        </div>
    );
}

export default EditorTabs;