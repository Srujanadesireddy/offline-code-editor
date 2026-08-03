import {
  FolderOpen,
  Search,
  GitBranch,
  Play,
  Bug,
  Settings,
  CircleUserRound,
} from "lucide-react";

function ActivityBar({ activePanel, setActivePanel }) {
  const iconStyle = (panel) =>
    `p-2 transition ${activePanel === panel
      ? "text-blue-500 border-l-2 border-blue-500 bg-slate-900"
      : "text-slate-400 hover:text-white"
    }`;

  return (
    <div className="w-14 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">

      <div className="flex-1 flex flex-col items-center py-3 gap-3">

        <button
          onClick={() => setActivePanel("explorer")}
          className={iconStyle("explorer")}
        >
          <FolderOpen size={24} />
        </button>

        <button
          onClick={() => setActivePanel("search")}
          className={iconStyle("search")}
        >
          <Search size={24} />
        </button>

        <button
          onClick={() => setActivePanel("git")}
          className={iconStyle("git")}
        >
          <GitBranch size={24} />
        </button>

        <button
          onClick={() => setActivePanel("run")}
          className={iconStyle("run")}
        >
          <Play size={24} />
        </button>

        <button
          onClick={() => setActivePanel("debug")}
          className={iconStyle("debug")}
        >
          <Bug size={24} />
        </button>

        <button
          onClick={() => setActivePanel("settings")}
          className={iconStyle("settings")}
        >
          <Settings size={24} />
        </button>

        <button
          onClick={() => setActivePanel("profile")}
          className={iconStyle("profile")}
        >
          <CircleUserRound size={24} />
        </button>

      </div>

      {/* <div className="flex justify-center items-center h-16 border-t border-slate-800">
        
      </div> */}

    </div>
  );
}

export default ActivityBar;