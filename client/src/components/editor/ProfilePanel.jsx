import {
  CircleUserRound,
  Mail,
  Shield,
  Code2,
  ExternalLink,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function ProfilePanel() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error(
      "Failed to read user data:",
      error
    );
  }

  const userName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Developer";

  const userEmail =
    user.email ||
    "No email available";

  const userRole =
    user.role ||
    "Standard User";


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };


  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 text-white overflow-y-auto">

      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center gap-2">

          <CircleUserRound
            size={18}
            className="text-blue-400"
          />

          <span className="font-semibold">
            Profile
          </span>

        </div>

      </div>


      {/* Profile */}

      <div className="flex flex-col items-center p-6">

        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">

          <span className="text-3xl font-bold">
            {userName
              .charAt(0)
              .toUpperCase()}
          </span>

        </div>


        <h2 className="text-xl font-bold text-center">
          {userName}
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          CodeSync Developer
        </p>

      </div>


      {/* Information */}

      <div className="px-5 space-y-4">

        <div className="flex items-start gap-3">

          <Mail
            size={18}
            className="text-blue-400 mt-0.5 flex-shrink-0"
          />

          <div className="min-w-0">

            <p className="text-xs text-slate-500">
              Email
            </p>

            <p className="text-sm text-slate-200 break-all">
              {userEmail}
            </p>

          </div>

        </div>


        <div className="flex items-center gap-3">

          <Shield
            size={18}
            className="text-green-400"
          />

          <div>

            <p className="text-xs text-slate-500">
              Account
            </p>

            <p className="text-sm text-slate-200">
              {userRole}
            </p>

          </div>

        </div>


        <div className="flex items-start gap-3">

          <Code2
            size={18}
            className="text-purple-400 mt-0.5"
          />

          <div>

            <p className="text-xs text-slate-500">
              Technologies
            </p>

            <p className="text-sm text-slate-200">
              React • Express • MongoDB
            </p>

          </div>

        </div>

      </div>


      {/* Actions */}

      <div className="p-5 mt-4 space-y-3">

        <button
          onClick={() =>
            navigate("/profile")
          }
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >

          <div className="text-left">

            <p className="text-sm font-medium">
              Full Profile
            </p>

            <p className="text-xs text-slate-500 mt-1">
              View your account
            </p>

          </div>

          <ExternalLink
            size={17}
            className="text-blue-400"
          />

        </button>


        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition"
        >

          <LogOut size={17} />

          Logout

        </button>

      </div>

    </div>
  );
}

export default ProfilePanel;