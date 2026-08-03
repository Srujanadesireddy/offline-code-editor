import { NavLink } from "react-router-dom";
import {
  Home,
  FolderKanban,
  Code2,
  Settings,
  User,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Projects", icon: FolderKanban, path: "/projects" },
    { name: "Editor", icon: Code2, path: "/editor" },
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col border-r border-slate-800">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide">
          CodeSync
        </h1>
        <p className="text-sm text-slate-500 mt-1">
            Offline • Collaborative • Fast
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600 hover:text-white transition">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;