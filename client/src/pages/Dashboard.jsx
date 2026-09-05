import { useEffect, useState } from "react";
import { FolderOpen, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../components/dashboard/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import NewProjectCard from "../components/dashboard/NewProjectCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import Sidebar from "../components/dashboard/Sidebar";

import {
  saveProject,
  getProjects,
} from "../database/indexedDB";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load projects"
        );
      }

      const fetchedProjects = data.projects || [];

      setProjects(fetchedProjects);

      // Cache projects locally
      for (const project of fetchedProjects) {
        await saveProject({
          id: project._id,
          name: project.name,
          description: project.description || "",
          owner: project.owner,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        });
      }
    } catch (error) {
      console.error(
        "Dashboard project error:",
        error
      );

      // OFFLINE FALLBACK
      try {
        const cachedProjects = await getProjects();

        setProjects(cachedProjects || []);

        if (cachedProjects?.length > 0) {
          toast("Offline mode: showing saved projects");
        }
      } catch (offlineError) {
        console.error(
          "Offline project loading error:",
          offlineError
        );

        setError("Unable to load projects.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (project) => {
    if (!project) return;

    setProjects((prev) => [
      project,
      ...prev,
    ]);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects((prev) =>
      prev.filter(
        (project) =>
          project._id !== projectId &&
          project.id !== projectId
      )
    );
  };

  const handleJoinProject = async () => {
    const code = inviteCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      setJoining(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/projects/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inviteCode: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to join project"
        );
      }

      const joinedProject = data.project;

      // Save joined project locally
      await saveProject({
        id: joinedProject._id,
        name: joinedProject.name,
        description: joinedProject.description || "",
        owner: joinedProject.owner,
        createdAt: joinedProject.createdAt,
        updatedAt: joinedProject.updatedAt,
      });

      toast.success("Joined project successfully!");

      setProjects((prev) => {
        const exists = prev.some(
          (project) =>
            (project._id || project.id) === joinedProject._id
        );

        if (exists) {
          return prev;
        }

        return [joinedProject, ...prev];
      });

      setInviteCode("");
      setShowJoinModal(false);

    } catch (error) {
      console.error("Join project error:", error);

      toast.error(
        error.message || "Unable to join project"
      );
    } finally {
      setJoining(false);
    }
  };

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 6);

  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="max-w-7xl mx-auto p-6 lg:p-8">

          <WelcomeCard
            projectCount={projects.length}
          />

          <NewProjectCard
            onProjectCreated={handleProjectCreated}
          />

          {/* Recent Projects */}

          <div className="flex items-center justify-between mt-12 mb-6">

            <div>
              <h2 className="text-3xl font-bold text-white">
                Recent Projects
              </h2>

              <p className="text-slate-400 mt-1">
                Continue working on your latest projects.
              </p>
            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
              >
                <UserPlus size={17} />
                Join Project
              </button>

              <button
                onClick={() =>
                  navigate("/projects")
                }
                className="text-blue-400 hover:text-blue-300 font-medium transition"
              >
                View all →
              </button>

            </div>

          </div>

          {/* Loading */}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

              <p className="text-slate-400 mt-4">
                Loading projects...
              </p>

            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="bg-red-950/40 border border-red-800 rounded-2xl p-6">

              <p className="text-red-400">
                {error}
              </p>

              <button
                onClick={fetchProjects}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Try Again
              </button>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            recentProjects.length === 0 && (

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

                <FolderOpen
                  size={48}
                  className="mx-auto text-slate-600"
                />

                <h3 className="text-xl font-semibold text-white mt-4">
                  No projects yet
                </h3>

                <p className="text-slate-400 mt-2">
                  Create your first project and start coding.
                </p>

              </div>
            )}

          {/* Projects */}

          {!loading &&
            !error &&
            recentProjects.length > 0 && (

              <div className="space-y-4">

                {recentProjects.map((project) => (

                  <ProjectCard
                    key={project._id || project.id}
                    project={project}
                    onDeleted={handleProjectDeleted}
                  />

                ))}

              </div>
            )}

        </main>

        {showJoinModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="w-full max-w-md bg-[#252526] border border-slate-700 rounded-xl shadow-2xl p-6">

              {/* Header */}

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Join Project
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Enter the invite code shared by the project owner.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode("");
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Input */}

              <label className="block text-sm text-slate-300 mb-2">
                Invite Code
              </label>

              <input
                type="text"
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(
                    e.target.value.toUpperCase()
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinProject();
                  }
                }}
                placeholder="Enter invite code"
                maxLength={8}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono tracking-widest outline-none focus:border-blue-500"
                autoFocus
              />

              {/* Buttons */}

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode("");
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleJoinProject}
                  disabled={joining || !inviteCode.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {joining ? "Joining..." : "Join Project"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;