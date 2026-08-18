import {
  GitBranch,
  RefreshCw,
  FileCode2,
  Circle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";
import { useState } from "react";

function GitPanel() {
  const {
    dirtyFiles,
    activeFile,
  } = useEditor();

  const [lastUpdated, setLastUpdated] =
    useState(new Date());


  const refreshStatus = () => {
    setLastUpdated(new Date());
  };


  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 text-white flex flex-col">


      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <GitBranch
              size={18}
              className="text-blue-400"
            />

            <span className="font-semibold">
              Source Control
            </span>

          </div>


          <button
            onClick={refreshStatus}
            title="Refresh"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} />
          </button>

        </div>

      </div>


      {/* Branch */}

      <div className="px-4 py-3 border-b border-slate-800">

        <p className="text-xs text-slate-500 mb-2">
          Branch
        </p>

        <div className="flex items-center gap-2">

          <GitBranch
            size={16}
            className="text-green-400"
          />

          <span className="text-sm font-medium">
            main
          </span>

        </div>

      </div>


      {/* Changes */}

      <div className="flex-1 overflow-y-auto">


        <div className="px-4 py-3">

          <div className="flex items-center justify-between mb-3">

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Changes
            </p>

            {dirtyFiles.length > 0 && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">
                {dirtyFiles.length}
              </span>
            )}

          </div>


          {dirtyFiles.length === 0 ? (

            <div className="flex flex-col items-center text-center py-8">

              <CheckCircle2
                size={32}
                className="text-green-500 mb-3"
              />

              <p className="text-sm text-slate-300">
                No changes
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Working tree is clean
              </p>

            </div>

          ) : (

            <div className="space-y-1">

              {dirtyFiles.map(
                (fileName) => (

                  <div
                    key={fileName}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >

                    <FileCode2
                      size={15}
                      className="text-blue-400 flex-shrink-0"
                    />

                    <span className="text-sm text-slate-300 truncate flex-1">
                      {fileName}
                    </span>

                    <span
                      className="text-yellow-400 text-xs font-bold"
                      title="Modified"
                    >
                      M
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* Active File */}

        <div className="px-4 py-4 border-t border-slate-800">

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Current Editor
          </p>


          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">

            <div className="flex items-center gap-2">

              <FileCode2
                size={16}
                className="text-blue-400"
              />

              <span className="text-sm text-slate-300 truncate">
                {activeFile ||
                  "No file selected"}
              </span>

            </div>


            {activeFile &&
              dirtyFiles.includes(
                activeFile
              ) && (
                <div className="flex items-center gap-2 mt-2">

                  <Circle
                    size={7}
                    className="fill-yellow-400 text-yellow-400"
                  />

                  <span className="text-xs text-yellow-400">
                    Unsaved changes
                  </span>

                </div>
              )}

          </div>

        </div>


        {/* Git Integration Info */}

        <div className="px-4 py-4 border-t border-slate-800">

          <div className="flex gap-3">

            <Info
              size={17}
              className="text-blue-400 flex-shrink-0 mt-0.5"
            />

            <div>

              <p className="text-xs font-medium text-slate-300">
                Local Git Integration
              </p>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Source control operations will be connected to project repositories in a later phase.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Footer */}

      <div className="px-4 py-3 border-t border-slate-800">

        <p className="text-[10px] text-slate-600">
          Last checked: {formatTime(lastUpdated)}
        </p>

      </div>

    </div>
  );
}

export default GitPanel;