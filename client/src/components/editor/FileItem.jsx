import { useState } from "react";
import { FileCode, Folder, FolderOpen } from "lucide-react";
import { useEditor } from "../../context/EditorContext";

function FileItem({ item, handleRightClick }) {
  const { activeFile, openFile } = useEditor();
  const [expanded, setExpanded] = useState(true);

  const isFolder = item.type === "folder";

  return (
    <div className="ml-2">
      <div
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          } else {
            openFile(item.name);
          }
        }}
        onContextMenu={(e) => handleRightClick(e, item)}
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition ${
          activeFile === item.name
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`}
      >
        {isFolder ? (
          expanded ? (
            <FolderOpen size={16} />
          ) : (
            <Folder size={16} />
          )
        ) : (
          <FileCode size={16} />
        )}

        <span>{item.name}</span>
      </div>

      {isFolder &&
        expanded &&
        item.children?.map((child) => (
          <FileItem
            key={child.id}
            item={child}
            handleRightClick={handleRightClick}
          />
        ))}
    </div>
  );
}

export default FileItem;