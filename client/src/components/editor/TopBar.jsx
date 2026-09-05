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
  Users,
  Copy,
  Check,
} from "lucide-react";

import FileMenu from "./FileMenu";
import NetworkStatus from "./NetworkStatus";

import { useEditor } from "../../context/EditorContext";

function TopBar({
  activePanel,
  setActivePanel,
  onTerminalToggle,
  projectId,
  connectedUsers,
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

  const [inviteCode, setInviteCode] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    if (!projectId) {
      return;
    }

    try {
      setShareLoading(true);
      setCopied(false);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create invite"
        );
      }

      setInviteCode(data.inviteCode);
      setOpenMenu("share");
    } catch (error) {
      console.error("Share error:", error);

      window.alert(
        error.message || "Unable to share project"
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      if (!inviteCode) return;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteCode);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = inviteCode;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";

        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error("Copy failed:", error);
      window.alert("Unable to copy invite code");
    }
  };


  return (
    <div
      ref={menuRef}
      className="relative h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4"
    >


      {/* Menus */}

      <div className="flex items-center gap-5">

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
                className={`flex items-center gap-1 text-sm transition ${openMenu === menu
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


      {/* Collaboration + Network */}

      <div className="flex items-center gap-3">

        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(
                openMenu === "users"
                  ? null
                  : "users"
              )
            }
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
          >
            <Users size={15} />
            {connectedUsers?.length || 0}
          </button>

          {openMenu === "users" && (
            <div className="absolute top-12 right-0 w-64 bg-[#252526] border border-slate-700 rounded-lg shadow-2xl z-50 p-4">
              <h3 className="text-white font-semibold mb-3">
                Collaborators
              </h3>

              {connectedUsers?.length > 0 ? (
                <div className="space-y-2">
                  {connectedUsers.map((user) => (
                    <div
                      key={user.socketId}
                      className="flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full" />

                      <span className="text-slate-200 text-sm">
                        {user.user?.name || "Anonymous"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No collaborators connected.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm transition"
        >
          <Users size={15} />
          Share
        </button>

        {openMenu === "share" && (
          <div className="absolute top-12 right-4 w-80 bg-[#252526] border border-slate-700 rounded-lg shadow-2xl z-50 p-4">

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">
                Share Project
              </h3>

              <button
                onClick={() => {
                  setOpenMenu(null);
                  setCopied(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {shareLoading ? (
              <p className="text-sm text-slate-400">
                Generating invite code...
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-3">
                  Share this invite code with another user
                  to collaborate on this project.
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-center text-lg font-mono tracking-widest text-white">
                    {inviteCode || "------"}
                  </div>

                  <button
                    onClick={handleCopyInvite}
                    disabled={!inviteCode}
                    className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
                    title="Copy invite code"
                  >
                    {copied ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>

                {copied && (
                  <p className="text-xs text-green-400 mt-2">
                    Invite code copied!
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <NetworkStatus />
      </div>
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