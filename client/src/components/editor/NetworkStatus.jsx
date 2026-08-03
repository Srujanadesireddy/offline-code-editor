import { useEffect, useState } from "react";

function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        online
          ? "bg-green-900 text-green-300"
          : "bg-red-900 text-red-300"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          online ? "bg-green-400" : "bg-red-400"
        }`}
      ></div>

      {online ? "Connected" : "Offline"}
    </div>
  );
}

export default NetworkStatus;