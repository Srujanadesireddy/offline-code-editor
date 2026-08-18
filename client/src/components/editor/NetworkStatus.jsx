import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:5000/api/test";

function NetworkStatus() {
  const [browserOnline, setBrowserOnline] =
    useState(navigator.onLine);

  const [serverOnline, setServerOnline] =
    useState(false);

  const [checking, setChecking] =
    useState(true);


  /*
   * Check whether the Express backend
   * is actually reachable.
   */

  const checkServerConnection = async () => {
    if (!navigator.onLine) {
      setServerOnline(false);
      setChecking(false);
      return;
    }

    try {
      setChecking(true);

      const controller =
        new AbortController();

      const timeout =
        setTimeout(() => {
          controller.abort();
        }, 3000);

      const response = await fetch(
        BACKEND_URL,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        }
      );

      clearTimeout(timeout);

      if (response.ok) {
        const data =
          await response.json();

        setServerOnline(
          data.success === true
        );
      } else {
        setServerOnline(false);
      }

    } catch (error) {
      console.log(
        "Backend connection unavailable"
      );

      setServerOnline(false);

    } finally {
      setChecking(false);
    }
  };


  /*
   * Browser online/offline detection.
   */

  useEffect(() => {
    const goOnline = () => {
      setBrowserOnline(true);
      checkServerConnection();
    };

    const goOffline = () => {
      setBrowserOnline(false);
      setServerOnline(false);
      setChecking(false);
    };

    window.addEventListener(
      "online",
      goOnline
    );

    window.addEventListener(
      "offline",
      goOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        goOnline
      );

      window.removeEventListener(
        "offline",
        goOffline
      );
    };
  }, []);


  /*
   * Initial backend check + periodic
   * connection check.
   */

  useEffect(() => {
    checkServerConnection();

    const interval =
      setInterval(
        checkServerConnection,
        10000
      );

    return () => {
      clearInterval(interval);
    };
  }, []);


  /*
   * Determine current status.
   */

  let status = "offline";
  let label = "Offline";

  if (checking) {
    status = "checking";
    label = "Checking...";
  } else if (!browserOnline) {
    status = "offline";
    label = "Offline";
  } else if (!serverOnline) {
    status = "server-offline";
    label = "Server Offline";
  } else {
    status = "connected";
    label = "Connected";
  }


  const statusStyles = {
    connected:
      "bg-green-900 text-green-300",

    "server-offline":
      "bg-yellow-900 text-yellow-300",

    offline:
      "bg-red-900 text-red-300",

    checking:
      "bg-slate-800 text-slate-400",
  };


  const dotStyles = {
    connected:
      "bg-green-400",

    "server-offline":
      "bg-yellow-400",

    offline:
      "bg-red-400",

    checking:
      "bg-slate-400",
  };


  return (
    <div
      title={
        status === "connected"
          ? "Internet and backend are connected"
          : status ===
            "server-offline"
          ? "Internet is available, but the backend server cannot be reached"
          : status === "offline"
          ? "No internet connection"
          : "Checking connection..."
      }
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${statusStyles[status]}`}
    >

      <div
        className={`w-2 h-2 rounded-full ${dotStyles[status]}`}
      />

      {label}

    </div>
  );
}

export default NetworkStatus;