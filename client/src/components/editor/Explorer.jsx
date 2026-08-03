import { useState } from "react";
import { useEditor } from "../../context/EditorContext";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import FileItem from "./FileItem";
import ContextMenu from "./ContextMenu";

function Explorer() {
  const { explorer } = useEditor();

  const [openFolders, setOpenFolders] = useState({
    src: true,
    public: true,
  });

  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleRightClick = (e, item = null) => {
    e.preventDefault();

    setMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      item,
    });
  };

  return (
    <div
      className="w-64 bg-slate-900 border-r border-slate-700 text-white"
      onClick={() =>
        setMenu({
          visible: false,
          x: 0,
          y: 0,
          item: null,
        })
      }
    >
      <div className="p-4 border-b border-slate-700 font-semibold">
        EXPLORER
      </div>

      <div className="p-2">
        {explorer.map((folder) => (
          <div key={folder.id}>
            <div
              onClick={() => toggleFolder(folder.name)}
              onContextMenu={(e) => handleRightClick(e, folder)}
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-700"
            >
              {openFolders[folder.name] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}

              <Folder size={16} />

              <span>{folder.name}</span>
            </div>

            {openFolders[folder.name] && (
              <div className="ml-4">
                {folder.children.map((child) => (
                  <FileItem
                    key={child.id}
                    item={child}
                    handleRightClick={handleRightClick}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <ContextMenu
        visible={menu.visible}
        x={menu.x}
        y={menu.y}
        item={menu.item}
        onClose={() =>
          setMenu({
            visible: false,
            x: 0,
            y: 0,
            item: null,
          })
        }
      />
    </div>
  );
}

export default Explorer;