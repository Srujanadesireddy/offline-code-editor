import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  startSyncEngine,
  stopSyncEngine,
} from "./sync/syncEngine";

import ProtectedRoute from "./components/ProtectedRoute";
import { initDB } from "./database/indexedDB";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";

function App() {
  useEffect(() => {
    initDB();

    startSyncEngine();

    return () => {
      stopSyncEngine();
    };
  }, []);
  return (
    <BrowserRouter>

      <Routes>

        {/* Public */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* Projects */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />


        {/* Settings */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* Editor without project */}

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Navigate
                to="/projects"
                replace
              />
            </ProtectedRoute>
          }
        />


        {/* Actual Editor */}

        <Route
          path="/editor/:projectId"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;