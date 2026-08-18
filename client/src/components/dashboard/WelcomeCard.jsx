import {
  FolderKanban,
  HardDrive,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

function WelcomeCard({ projectCount = 0 }) {
  const [isOnline, setIsOnline] = useState(
    navigator.onLine
  );

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Developer";

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 mb-8">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-blue-600 font-semibold text-lg">
            👋 {getGreeting()}
          </p>

          <h1 className="text-4xl font-bold mt-2 text-slate-900">
            Welcome back,
            <span className="text-blue-600">
              {" "}{userName}
            </span>
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Ready to continue building your next amazing project?
          </p>

        </div>

        <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-3xl bg-blue-100 text-5xl">
          💻
        </div>

      </div>


      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">


        {/* Projects */}

        <div className="bg-slate-100 rounded-2xl p-5">

          <FolderKanban
            className="text-blue-600 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Projects
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            {projectCount}
          </h2>

        </div>


        {/* Connection */}

        <div className="bg-slate-100 rounded-2xl p-5">

          {isOnline ? (
            <Wifi
              className="text-green-600 mb-3"
              size={28}
            />
          ) : (
            <WifiOff
              className="text-red-600 mb-3"
              size={28}
            />
          )}

          <p className="text-slate-500 text-sm">
            Connection
          </p>

          <h2
            className={`text-xl font-bold ${
              isOnline
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </h2>

        </div>


        {/* Storage */}

        <div className="bg-slate-100 rounded-2xl p-5">

          <HardDrive
            className="text-orange-500 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Storage
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            Ready
          </h2>

        </div>

      </div>

    </div>
  );
}

export default WelcomeCard;