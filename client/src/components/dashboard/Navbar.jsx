import {
  Bell,
  Search,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Developer";

  const initials =
    userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8">

      {/* Search */}

      <div className="relative w-full max-w-md">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search projects, files..."
          className="w-full bg-slate-900 text-white rounded-xl pl-11 pr-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      {/* Right Section */}

      <div className="flex items-center gap-4 ml-6">

        {/* Notifications */}

        <button
          className="relative p-2 rounded-lg hover:bg-slate-800 transition"
          title="Notifications"
        >

          <Bell
            size={22}
            className="text-slate-300"
          />

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />

        </button>


        {/* User */}

        <div className="hidden sm:flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">

          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            {initials}
          </div>

          <div>

            <p className="text-white font-medium">
              {userName}
            </p>

            <p className="text-xs text-slate-400">
              Developer
            </p>

          </div>

        </div>


        {/* Logout */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
        >

          <LogOut size={18} />

          <span className="hidden sm:inline">
            Logout
          </span>

        </button>

      </div>

    </header>
  );
}

export default Navbar;