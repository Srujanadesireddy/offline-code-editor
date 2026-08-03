import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");

  };

  return (
    <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8">

      {/* Search Bar */}
      <div className="relative w-96">
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
      <div className="flex items-center gap-6">

        <button className="relative p-2 rounded-lg hover:bg-slate-800 transition">
          <Bell size={22} className="text-slate-300" />

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">

          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            S
          </div>

          <div>
            <p className="text-white font-medium">
              Srujana
            </p>

            <p className="text-xs text-slate-400">
              Developer
            </p>
          </div>
          
        </div>

        <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>

      </div>

    </header>
  );
}

export default Navbar;