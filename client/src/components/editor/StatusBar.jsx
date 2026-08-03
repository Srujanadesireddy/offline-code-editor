import { useEditor } from "../../context/EditorContext";

function StatusBar() {
  const { saveStatus } = useEditor();

  return (
    <div className="h-8 bg-[#0f172a] border-t border-slate-700 px-4 flex items-center justify-between text-sm text-white">
      <span>Status Bar</span>

      <span className="text-green-400">
        {saveStatus}
      </span>
    </div>
  );
}

export default StatusBar;