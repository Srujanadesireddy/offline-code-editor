import { useEffect, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/dashboard/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import NewProjectCard from "../components/dashboard/NewProjectCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import Sidebar from "../components/dashboard/Sidebar";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      setProjects(data.projects || []);
    } catch (error) {
      console.error("Dashboard project error:", error);
      setError("Unable to load projects.");
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
        (project) => project._id !== projectId
      )
    );
  };

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
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

            <button
              onClick={() =>
                navigate("/projects")
              }
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              View all →
            </button>

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
                    key={project._id}
                    project={project}
                    onDeleted={handleProjectDeleted}
                  />

                ))}

              </div>
            )}

        </main>

      </div>

    </div>
  );
}

export default Dashboard;