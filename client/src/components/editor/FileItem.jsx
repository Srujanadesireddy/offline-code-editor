import {
  FileCode,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";

function FileItem({
  item,
  handleRightClick,
  openFolders,
  toggleFolder,
}) {
  const {
    activeFile,
    openFile,
    dirtyFiles,
  } = useEditor();

  const isFolder =
    item.type === "folder";

  const isOpen =
    isFolder
      ? openFolders?.[item.id] ?? true
      : false;

  const isActive =
    !isFolder &&
    activeFile === item.name;

  const isDirty =
    !isFolder &&
    dirtyFiles?.includes(item.name);


  const handleClick = () => {

    if (isFolder) {

      toggleFolder(item.id);

      return;
    }

    openFile(item);
  };


  return (
    <div className="ml-1">

      {/* Item */}

      <div
        onClick={handleClick}
        onContextMenu={(e) => {
          e.stopPropagation();
          handleRightClick(
            e,
            item
          );
        }}
        className={`
          group
          flex
          items-center
          gap-1.5
          px-2
          py-1.5
          rounded-md
          cursor-pointer
          transition
          select-none
          text-sm

          ${
            isActive
              ? "bg-blue-600/90 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }
        `}
      >

        {/* Folder arrow */}

        {isFolder ? (

          isOpen ? (

            <ChevronDown
              size={14}
              className="text-slate-500 flex-shrink-0"
            />

          ) : (

            <ChevronRight
              size={14}
              className="text-slate-500 flex-shrink-0"
            />

          )

        ) : (

          <span className="w-3.5" />

        )}


        {/* Icon */}

        {isFolder ? (

          isOpen ? (

            <FolderOpen
              size={16}
              className={
                isActive
                  ? "text-white"
                  : "text-blue-400"
              }
            />

          ) : (

            <Folder
              size={16}
              className="text-blue-400"
            />

          )

        ) : (

          <FileCode
            size={16}
            className={
              isActive
                ? "text-white"
                : "text-slate-400"
            }
          />

        )}


        {/* Name */}

        <span className="truncate flex-1">
          {item.name}
        </span>


        {/* Modified indicator */}

        {isDirty && (

          <span
            title="Unsaved changes"
            className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"
          />

        )}

      </div>


      {/* Nested children */}

      {isFolder &&
        isOpen &&
        item.children?.length > 0 && (

          <div className="ml-4 border-l border-slate-800 pl-1">

            {item.children.map(
              (child) => (

                <FileItem
                  key={child.id}
                  item={child}
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

              )
            )}

          </div>

        )}


      {/* Empty folder */}

      {isFolder &&
        isOpen &&
        (!item.children ||
          item.children.length === 0) && (

          <div className="ml-8 py-1 text-[11px] text-slate-600 italic">
            Empty folder
          </div>

        )}

    </div>
  );
}

export default FileItem;