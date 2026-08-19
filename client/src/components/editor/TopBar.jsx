import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FilePlus,
  FolderPlus,
  Save,
  X,
  Undo2,
  Redo2,
  CheckSquare,
  Terminal,
  HelpCircle,
  Info,
} from "lucide-react";

import FileMenu from "./FileMenu";
import NetworkStatus from "./NetworkStatus";

import { useEditor } from "../../context/EditorContext";

function TopBar({
  activePanel,
  setActivePanel,
  onTerminalToggle,
}) {
  const {
    editorInstance,
    createNewFile,
    createNewFolder,
    openTabs,
    activeFile,
    setActiveFile,
  } = useEditor();

  const [openMenu, setOpenMenu] =
    useState(null);

  const menuRef =
    useRef(null);


  const menus = [
    "File",
    "Edit",
    "Selection",
    "View",
    "Terminal",
    "Help",
  ];


  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpenMenu(null);
      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  const runEditorAction = (
    action
  ) => {

    if (!editorInstance) {
      return;
    }

    action(editorInstance);

    setOpenMenu(null);
  };


  const closeActiveFile = () => {

    if (!activeFile) {
      setOpenMenu(null);
      return;
    }

    const remainingTabs =
      openTabs.filter(
        (file) =>
          file !== activeFile
      );

    if (
      remainingTabs.length > 0
    ) {

      setActiveFile(
        remainingTabs[
          remainingTabs.length - 1
        ]
      );

    } else {

      setActiveFile("");

    }

    setOpenMenu(null);
  };


  const handleMenuClick = (
    menu
  ) => {

    if (menu === "Terminal") {

      onTerminalToggle?.();

      setOpenMenu(null);

      return;
    }


    if (menu === "View") {

      setOpenMenu(
        openMenu === "View"
          ? null
          : "View"
      );

      return;
    }


    setOpenMenu(
      openMenu === menu
        ? null
        : menu
    );

  };


  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">


      {/* Menus */}

      <div
        ref={menuRef}
        className="flex items-center gap-5"
      >

        {menus.map(
          (menu) => (

            <div
              key={menu}
              className="relative"
            >

              <button
                onClick={() =>
                  handleMenuClick(
                    menu
                  )
                }
                className={`flex items-center gap-1 text-sm transition ${
                  openMenu === menu
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >

                {menu}

                {[
                  "File",
                  "Edit",
                  "Selection",
                  "View",
                  "Help",
                ].includes(menu) && (
                  <ChevronDown
                    size={13}
                    className="text-slate-500"
                  />
                )}

              </button>


              {/* File */}

              {menu === "File" &&
                openMenu === "File" && (

                  <div className="absolute top-9 left-0 w-56 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">

                    <MenuItem
                      icon={<FilePlus size={15} />}
                      label="New File"
                      onClick={() => {
                        createNewFile();
                        setOpenMenu(null);
                      }}
                    />

                    <MenuItem
                      icon={<FolderPlus size={15} />}
                      label="New Folder"
                      onClick={() => {
                        createNewFolder();
                        setOpenMenu(null);
                      }}
                    />

                    <MenuItem
                      icon={<Save size={15} />}
                      label="Save"
                      shortcut="Ctrl+S"
                      onClick={() => {
                        window.dispatchEvent(
                          new KeyboardEvent(
                            "keydown",
                            {
                              key: "s",
                              ctrlKey: true,
                            }
                          )
                        );

                        setOpenMenu(null);
                      }}
                    />

                    <MenuItem
                      icon={<X size={15} />}
                      label="Close File"
                      onClick={
                        closeActiveFile
                      }
                    />

                  </div>
                )}


              {/* Edit */}

              {menu === "Edit" &&
                openMenu === "Edit" && (

                  <div className="absolute top-9 left-0 w-52 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">

                    <MenuItem
                      icon={<Undo2 size={15} />}
                      label="Undo"
                      shortcut="Ctrl+Z"
                      onClick={() =>
                        runEditorAction(
                          (editor) =>
                            editor.trigger(
                              "keyboard",
                              "undo"
                            )
                        )
                      }
                    />

                    <MenuItem
                      icon={<Redo2 size={15} />}
                      label="Redo"
                      shortcut="Ctrl+Y"
                      onClick={() =>
                        runEditorAction(
                          (editor) =>
                            editor.trigger(
                              "keyboard",
                              "redo"
                            )
                        )
                      }
                    />

                  </div>
                )}


              {/* Selection */}

              {menu === "Selection" &&
                openMenu === "Selection" && (

                  <div className="absolute top-9 left-0 w-56 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50">

                    <MenuItem
                      icon={
                        <CheckSquare
                          size={15}
                        />
                      }
                      label="Select All"
                      shortcut="Ctrl+A"
                      onClick={() =>
                        runEditorAction(
                          (editor) => {
                            editor.focus();

                            const model =
                              editor.getModel();

                            if (model) {
                              editor.setSelection(
                                model.getFullModelRange()
                              );
                            }
                          }
                        )
                      }
                    />

                  </div>
                )}


              {/* View */}

              {menu === "View" &&
                openMenu === "View" && (

                  <div className="absolute top-9 left-0 w-56 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50">

                    {[
                      [
                        "Explorer",
                        "explorer",
                      ],
                      [
                        "Search",
                        "search",
                      ],
                      [
                        "Git",
                        "git",
                      ],
                      [
                        "Run",
                        "run",
                      ],
                      [
                        "Debug",
                        "debug",
                      ],
                      [
                        "Settings",
                        "settings",
                      ],
                      [
                        "Profile",
                        "profile",
                      ],
                    ].map(
                      ([label, panel]) => (

                        <MenuItem
                          key={panel}
                          label={label}
                          onClick={() => {
                            setActivePanel(
                              panel
                            );

                            setOpenMenu(
                              null
                            );
                          }}
                        />

                      )
                    )}

                  </div>
                )}


              {/* Help */}

              {menu === "Help" &&
                openMenu === "Help" && (

                  <div className="absolute top-9 left-0 w-60 bg-[#252526] border border-slate-700 rounded-md shadow-xl z-50">

                    <MenuItem
                      icon={
                        <HelpCircle
                          size={15}
                        />
                      }
                      label="Keyboard Shortcuts"
                      onClick={() => {
                        window.alert(
                          "Keyboard Shortcuts\n\nCtrl + S  → Save\nCtrl + Z  → Undo\nCtrl + Y  → Redo\nCtrl + A  → Select All"
                        );

                        setOpenMenu(
                          null
                        );
                      }}
                    />

                    <MenuItem
                      icon={
                        <Info size={15} />
                      }
                      label="About CodeSync"
                      onClick={() => {
                        window.alert(
                          "CodeSync\n\nOffline-First Collaborative Code Editor"
                        );

                        setOpenMenu(
                          null
                        );
                      }}
                    />

                  </div>
                )}

            </div>

          )
        )}

      </div>


      {/* Network */}

      <NetworkStatus />

    </div>
  );
}


function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition text-left"
    >

      {icon && (
        <span className="text-slate-400">
          {icon}
        </span>
      )}

      <span className="flex-1">
        {label}
      </span>

      {shortcut && (
        <span className="text-[11px] text-slate-500">
          {shortcut}
        </span>
      )}

    </button>
  );
}

export default TopBar;