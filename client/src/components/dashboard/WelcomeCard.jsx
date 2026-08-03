import { FolderKanban, HardDrive, Wifi } from "lucide-react";

function WelcomeCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md p-8 mb-8">

      <div className="flex justify-between items-start">

        {/* Left */}

        <div>
          <p className="text-blue-600 font-semibold text-lg">
            👋 Good Evening
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Welcome back,
            <span className="text-blue-600"> Srujana</span>
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Ready to continue building your next amazing project?
          </p>
        </div>

        {/* Right */}

        <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-3xl bg-blue-100 text-5xl">
          💻
        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-6 mt-10">

        <div className="bg-slate-100 rounded-2xl p-5">

          <FolderKanban
            className="text-blue-600 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Projects
          </p>

          <h2 className="text-3xl font-bold">
            12
          </h2>

        </div>

        <div className="bg-slate-100 rounded-2xl p-5">

          <Wifi
            className="text-green-600 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Sync Status
          </p>

          <h2 className="text-xl font-bold text-green-600">
            Online
          </h2>

        </div>

        <div className="bg-slate-100 rounded-2xl p-5">

          <HardDrive
            className="text-orange-500 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Storage Used
          </p>

          <h2 className="text-3xl font-bold">
            82%
          </h2>

        </div>

      </div>

    </div>
  );
}

export default WelcomeCard;