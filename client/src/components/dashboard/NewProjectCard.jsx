import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function NewProjectCard({ onProjectCreated }) {
  const [creating, setCreating] = useState(false);

  const createProject = async () => {
    const name = window.prompt("Enter Project Name");

    if (!name || !name.trim()) {
      return;
    }

    try {
      setCreating(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            description: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(
          data.message || "Failed to create project"
        );

        return;
      }

      toast.success("Project created successfully");

      onProjectCreated?.(data.project);

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

  return (
    <div className="mt-8">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]">

        <div className="flex justify-center mb-6">

          <div className="bg-blue-600 p-5 rounded-full">

            {creating ? (
              <Loader2
                size={36}
                className="text-white animate-spin"
              />
            ) : (
              <Plus
                size={36}
                className="text-white"
              />
            )}

          </div>

        </div>

        <h2 className="text-3xl font-bold text-white">
          Start a New Project
        </h2>

        <p className="text-slate-400 mt-3 max-w-lg mx-auto">
          Create a collaborative coding workspace
          and start building with your team in seconds.
        </p>

        <button
          onClick={createProject}
          disabled={creating}
          className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
        >
          {creating
            ? "Creating..."
            : "+ Create Project"}
        </button>

      </div>

    </div>
  );
}

export default NewProjectCard;