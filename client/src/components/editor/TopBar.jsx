import { useState, useEffect, useRef } from "react";
import FileMenu from "./FileMenu";
import NetworkStatus from "./NetworkStatus";

function TopBar() {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const menuRef = useRef(null);
  const menus = [
    "File",
    "Edit",
    "Selection",
    "View",
    "Terminal",
    "Help",
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowFileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">

      {/* Left Menu */}
      <div className="flex items-center gap-6">
        {menus.map((menu) => (
          <div
            key={menu}
            className="relative"
            ref={menu === "File" ? menuRef : null}
          >
            <button
              onClick={() => {
                if (menu === "File") {
                  setShowFileMenu(!showFileMenu);
                }
              }}
              className="text-sm text-slate-300 hover:text-white transition"
            >
              {menu}
            </button>

            {menu === "File" && (
              <FileMenu isOpen={showFileMenu} />
            )}
          </div>
        ))}
      </div>

      {/* Right Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>

        <span className="text-sm text-slate-300">
          <NetworkStatus />
        </span>
      </div>

    </div>
  );
}

export default TopBar;