import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  ChevronsDownUp,
  ChevronsUpDown,
  Files,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";
import FileItem from "./FileItem";
import ContextMenu from "./ContextMenu";

function Explorer() {
  const { explorer } = useEditor();

  const [openFolders, setOpenFolders] = useState({});

  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });


  /*
   * Open the root folder automatically
   * when the project structure loads.
   */

  useEffect(() => {
    if (!explorer?.length) {
      return;
    }

    const initialState = {};

    explorer.forEach((item) => {
      if (item.type === "folder") {
        initialState[item.id] = true;
      }
    });

    setOpenFolders((prev) => ({
      ...initialState,
      ...prev,
    }));
  }, [explorer]);


  const toggleFolder = (folderId) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };


  const setAllFolders = (isOpen) => {
    const state = {};

    const collectFolders = (items) => {
      items.forEach((item) => {
        if (item.type === "folder") {
          state[item.id] = isOpen;

          if (item.children?.length) {
            collectFolders(item.children);
          }
        }
      });
    };

    collectFolders(explorer || []);

    setOpenFolders(state);
  };


  const handleRightClick = (
    e,
    item = null
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      item,
    });
  };


  const closeMenu = () => {
    setMenu({
      visible: false,
      x: 0,
      y: 0,
      item: null,
    });
  };


  const totalItems = (items) => {
    let count = 0;

    items.forEach((item) => {
      count += 1;

      if (item.children?.length) {
        count += totalItems(item.children);
      }
    });

    return count;
  };


  return (
    <div
      className="w-64 h-full bg-slate-900 border-r border-slate-700 text-white flex flex-col"
      onClick={(e) => {
        /*
         * Only close the context menu when clicking
         * somewhere other than the context menu itself.
         */
        if (e.target === e.currentTarget) {
          closeMenu();
        }
      }}
    >

      {/* Header */}

      <div className="h-12 px-3 border-b border-slate-700 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Files
            size={17}
            className="text-blue-400"
          />

          <span className="text-xs font-semibold tracking-wide text-slate-300">
            EXPLORER
          </span>

        </div>


        <div className="flex items-center gap-1">

          <button
            onClick={() =>
              setAllFolders(true)
            }
            title="Expand all folders"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronsUpDown size={15} />
          </button>


          <button
            onClick={() =>
              setAllFolders(false)
            }
            title="Collapse all folders"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronsDownUp size={15} />
          </button>

        </div>

      </div>


      {/* Project title */}

      <div className="px-3 py-2 border-b border-slate-800">

        <div className="flex items-center gap-2">

          <FolderOpen
            size={15}
            className="text-blue-400"
          />

          <span className="text-xs font-medium text-slate-300">
            Project
          </span>

          <span className="ml-auto text-[10px] text-slate-600">
            {totalItems(explorer || [])}
          </span>

        </div>

      </div>


      {/* File tree */}

      <div
        className="flex-1 overflow-y-auto p-2"
        onContextMenu={(e) =>
          handleRightClick(e)
        }
      >

        {!explorer ||
        explorer.length === 0 ? (

          <div className="flex flex-col items-center justify-center text-center py-12 px-4">

            <Folder
              size={34}
              className="text-slate-700 mb-3"
            />

            <p className="text-sm text-slate-400">
              No files yet
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Create a file or folder to get started.
            </p>

          </div>

        ) : (

          explorer.map((item) => (

            <FileItem
              key={item.id}
              item={item}
              handleRightClick={
                handleRightClick
              }
              openFolders={
                openFolders
              }
              toggleFolder={
                toggleFolder
              }
            />

          ))

        )}

      </div>


      {/* Footer */}

      <div className="px-3 py-2 border-t border-slate-800">

        <p className="text-[10px] text-slate-600">
          {totalItems(explorer || [])} items
        </p>

      </div>


      <ContextMenu
        visible={menu.visible}
        x={menu.x}
        y={menu.y}
        item={menu.item}
        onClose={closeMenu}
      />

    </div>
  );
}

export default Explorer;