import { ChevronRight } from "lucide-react";
import { useEditor } from "../../context/EditorContext";

function Breadcrumb() {
  const { activeFile } = useEditor();

  return (
    <div className="h-10 flex items-center px-4 bg-slate-900 border-b border-slate-700 text-sm text-slate-300">
      <span>Project</span>

      <ChevronRight size={16} className="mx-2" />

      <span>src</span>

      <ChevronRight size={16} className="mx-2" />

      <span className="text-white">{activeFile}</span>
    </div>
  );
}

export default Breadcrumb;