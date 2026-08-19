import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FolderKanban,
  Plus,
  Search,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import ProjectCard from "../components/dashboard/ProjectCard";

function Projects() {

  const [searchParams] =
    useSearchParams();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Failed to load projects"
        );
      }

      setProjects(
        data.projects || []
      );

    } catch (error) {
      console.error(
        "Projects page error:",
        error
      );

      toast.error(
        error.message ||
        "Unable to load projects"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProjects();
  }, []);


  const createProject = async () => {

    const name =
      window.prompt(
        "Enter Project Name"
      );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    try {

      setCreating(true);

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          "http://localhost:5000/api/projects",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: name.trim(),
              description: "",
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        toast.error(
          data.message ||
          "Failed to create project"
        );

        return;
      }

      setProjects(
        (prev) => [
          data.project,
          ...prev,
        ]
      );

      toast.success(
        "Project created successfully"
      );

    } catch (error) {

      console.error(
        "Create project error:",
        error
      );

      toast.error(
        "Unable to create project"
      );

    } finally {

      setCreating(false);

    }
  };


  const handleProjectDeleted =
    (projectId) => {

      setProjects(
        (prev) =>
          prev.filter(
            (project) =>
              project._id !==
              projectId
          )
      );
    };


  const filteredProjects =
    projects.filter(
      (project) =>
        project.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="max-w-7xl mx-auto p-6 lg:p-8">

          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

            <div>

              <h1 className="text-4xl font-bold text-white">
                My Projects
              </h1>

              <p className="text-slate-400 mt-2">
                Manage and open all your coding projects.
              </p>

            </div>


            <button
              onClick={createProject}
              disabled={creating}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition"
            >

              {creating ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <Plus size={20} />
              )}

              {creating
                ? "Creating..."
                : "New Project"}

            </button>

          </div>


          {/* Search */}

          <div className="relative mb-8">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search your projects..."
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          {/* Loading */}

          {loading && (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

              <Loader2
                size={32}
                className="mx-auto text-blue-500 animate-spin"
              />

              <p className="text-slate-400 mt-4">
                Loading projects...
              </p>

            </div>

          )}


          {/* Empty */}

          {!loading &&
            filteredProjects.length ===
            0 && (

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

                <FolderKanban
                  size={52}
                  className="mx-auto text-slate-600"
                />

                <h2 className="text-xl font-semibold text-white mt-4">

                  {search
                    ? "No matching projects"
                    : "No projects yet"}

                </h2>

                <p className="text-slate-400 mt-2">

                  {search
                    ? "Try a different project name."
                    : "Create your first project to get started."}

                </p>

              </div>

            )}


          {/* Projects */}

          {!loading &&
            filteredProjects.length >
            0 && (

              <div className="space-y-4">

                {filteredProjects.map(
                  (project) => (

                    <ProjectCard
                      key={project._id}
                      project={project}
                      onDeleted={
                        handleProjectDeleted
                      }
                    />

                  )
                )}

              </div>

            )}

        </main>

      </div>

    </div>
  );
}

export default Projects;