import {
  Bell,
  Search,
  LogOut,
  User,
  FolderKanban,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] =
    useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const notificationRef =
    useRef(null);

  const searchRef =
    useRef(null);


  /*
   * User
   */

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error(
      "Failed to read user:",
      error
    );
  }


  const userName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Developer";

  const initials =
    userName
      .charAt(0)
      .toUpperCase();


  /*
   * Logout
   */

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };


  /*
   * Search
   */

  const handleSearch = (value) => {

    setSearch(value);

    setShowSearchResults(
      value.trim().length > 0
    );
  };


  const handleSearchSubmit = (e) => {

    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    navigate(
      `/projects?search=${encodeURIComponent(
        search.trim()
      )}`
    );

    setShowSearchResults(false);
  };


  /*
   * Close dropdowns when clicking outside
   */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }


      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSearchResults(false);
      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /*
   * Notifications
   */

  const notifications = [
    {
      id: 1,
      title: "Welcome to CodeSync",
      message:
        "Your offline-first coding workspace is ready.",
      time: "Now",
    },
    {
      id: 2,
      title: "Workspace ready",
      message:
        "You can create and manage your projects.",
      time: "Today",
    },
  ];


  return (
    <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8">


      {/* Search */}

      <div
        ref={searchRef}
        className="relative w-full max-w-md"
      >

        <form
          onSubmit={
            handleSearchSubmit
          }
        >

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
            placeholder="Search projects..."
            className="w-full bg-slate-900 text-white rounded-xl pl-11 pr-10 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


          {search && (

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setShowSearchResults(
                  false
                );
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >

              <X size={16} />

            </button>

          )}

        </form>


        {/* Search dropdown */}

        {showSearchResults && (

          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">

            <button
              onClick={() =>
                handleSearchSubmit({
                  preventDefault: () => {},
                })
              }
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition"
            >

              <FolderKanban
                size={18}
                className="text-blue-400"
              />

              <div>

                <p className="text-sm text-white">
                  Search Projects
                </p>

                <p className="text-xs text-slate-500">
                  Find projects matching "
                  {search}
                  "
                </p>

              </div>

            </button>

          </div>

        )}

      </div>


      {/* Right Section */}

      <div className="flex items-center gap-4 ml-6">


        {/* Notifications */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            onClick={() =>
              setShowNotifications(
                (prev) => !prev
              )
            }
            className="relative p-2.5 rounded-lg hover:bg-slate-800 transition"
            title="Notifications"
          >

            <Bell
              size={22}
              className="text-slate-300"
            />

            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />

          </button>


          {showNotifications && (

            <div className="absolute right-0 top-full mt-3 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">

              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">

                <div>

                  <h3 className="font-semibold text-white">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Recent CodeSync updates
                  </p>

                </div>

                <span className="text-xs text-blue-400">
                  {notifications.length} new
                </span>

              </div>


              <div>

                {notifications.map(
                  (notification) => (

                    <div
                      key={
                        notification.id
                      }
                      className="px-4 py-4 border-b border-slate-800 hover:bg-slate-800/60 transition"
                    >

                      <div className="flex gap-3">

                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />

                        <div>

                          <p className="text-sm font-medium text-white">
                            {
                              notification.title
                            }
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {
                              notification.message
                            }
                          </p>

                          <p className="text-[11px] text-slate-600 mt-2">
                            {
                              notification.time
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>


        {/* User Profile */}

        <button
          onClick={() =>
            navigate("/profile")
          }
          className="hidden sm:flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition text-left"
          title="Open Profile"
        >

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

        </button>


        {/* Mobile profile */}

        <button
          onClick={() =>
            navigate("/profile")
          }
          className="sm:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          title="Profile"
        >
          <User size={20} />
        </button>


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