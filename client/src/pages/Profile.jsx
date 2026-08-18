import {
  CircleUserRound,
  Mail,
  Shield,
  Code2,
  FolderKanban,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Profile() {
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
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}

      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 lg:px-10">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to dashboard"
          >

            <ArrowLeft size={20} />

          </button>


          <div>

            <h1 className="text-xl font-bold">
              Profile
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Manage your CodeSync account
            </p>

          </div>

        </div>


        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition"
        >

          <LogOut size={17} />

          Logout

        </button>

      </header>


      {/* Main */}

      <main className="max-w-5xl mx-auto p-6 lg:p-10">


        {/* Profile Header */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">

            <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">

              <span className="text-5xl font-bold">
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </span>

            </div>


            <div>

              <p className="text-sm text-blue-400 font-medium mb-1">
                CodeSync Developer
              </p>

              <h2 className="text-3xl font-bold">
                {userName}
              </h2>

              <p className="text-slate-400 mt-2">
                {userEmail}
              </p>

              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">

                <span className="w-2 h-2 rounded-full bg-green-400" />

                <span className="text-sm text-green-400">
                  Active Account
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* Account Information */}

        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-6 border-b border-slate-800">

            <h3 className="text-lg font-semibold">
              Account Information
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Information associated with your CodeSync account.
            </p>

          </div>


          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">


            {/* Name */}

            <InfoCard
              icon={
                <CircleUserRound
                  size={20}
                  className="text-blue-400"
                />
              }
              label="Username"
              value={userName}
            />


            {/* Email */}

            <InfoCard
              icon={
                <Mail
                  size={20}
                  className="text-purple-400"
                />
              }
              label="Email"
              value={userEmail}
            />


            {/* Role */}

            <InfoCard
              icon={
                <Shield
                  size={20}
                  className="text-green-400"
                />
              }
              label="Account Type"
              value={userRole}
            />


            {/* Status */}

            <InfoCard
              icon={
                <CircleUserRound
                  size={20}
                  className="text-cyan-400"
                />
              }
              label="Status"
              value="Active"
            />

          </div>

        </section>


        {/* Developer Information */}

        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-6 border-b border-slate-800">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-xl bg-purple-500/10">

                <Code2
                  size={20}
                  className="text-purple-400"
                />

              </div>

              <div>

                <h3 className="text-lg font-semibold">
                  Development Stack
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Technologies used in the CodeSync project.
                </p>

              </div>

            </div>

          </div>


          <div className="p-6 flex flex-wrap gap-3">

            <TechBadge>
              React
            </TechBadge>

            <TechBadge>
              Vite
            </TechBadge>

            <TechBadge>
              Tailwind CSS
            </TechBadge>

            <TechBadge>
              Node.js
            </TechBadge>

            <TechBadge>
              Express
            </TechBadge>

            <TechBadge>
              MongoDB
            </TechBadge>

            <TechBadge>
              Monaco Editor
            </TechBadge>

          </div>

        </section>


        {/* Workspace */}

        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-xl bg-blue-500/10">

              <FolderKanban
                size={20}
                className="text-blue-400"
              />

            </div>

            <div>

              <h3 className="text-lg font-semibold">
                Workspace
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Continue working on your projects from the dashboard.
              </p>

            </div>

          </div>


          <button
            onClick={() =>
              navigate("/projects")
            }
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
          >
            View Projects →
          </button>

        </section>


        {/* Settings shortcut */}

        <section className="mt-6 mb-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h3 className="text-lg font-semibold">
            Preferences
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Customize your CodeSync workspace.
          </p>

          <button
            onClick={() =>
              navigate("/settings")
            }
            className="mt-5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            Open Settings →
          </button>

        </section>

      </main>

    </div>
  );
}


/* Information Card */

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-800 rounded-xl p-4">

      <div className="p-2.5 rounded-lg bg-slate-800">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-200 mt-1 break-all">
          {value}
        </p>

      </div>

    </div>
  );
}


/* Technology Badge */

function TechBadge({ children }) {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300">
      {children}
    </span>
  );
}

export default Profile;