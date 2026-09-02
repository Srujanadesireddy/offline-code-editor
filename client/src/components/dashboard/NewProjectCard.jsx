import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  saveProject,
  addOperation,
} from "../../database/indexedDB";

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
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      // Save online project locally
      await saveProject({
        id: data.project._id,
        name: data.project.name,
        description: data.project.description || "",
        owner: data.project.owner,
        createdAt: data.project.createdAt,
        updatedAt: data.project.updatedAt,
      });

      toast.success("Project created successfully");

      onProjectCreated?.(data.project);

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      // OFFLINE PROJECT
      try {
        const localId =
          `local-project-${Date.now()}`;

        const now =
          new Date().toISOString();

        const offlineProject = {
          _id: localId,
          id: localId,
          name: name.trim(),
          description: "",
          owner: localStorage.getItem("userId") || null,
          createdAt: now,
          updatedAt: now,
          offline: true,
        };

        // Save project locally
        await saveProject({
          id: localId,
          name: offlineProject.name,
          description: "",
          owner: offlineProject.owner,
          createdAt: now,
          updatedAt: now,
        });

        // Add operation to sync queue
        await addOperation({
          type: "CREATE_PROJECT",
          entityId: localId,
          projectId: localId,

          data: {
            name: offlineProject.name,
            description: "",
          },
        });

        // Immediately update Dashboard
        onProjectCreated?.(offlineProject);

        toast.success(
          "Project created offline"
        );

      } catch (offlineError) {
        console.error(
          "Offline project creation error:",
          offlineError
        );

        toast.error(
          "Unable to create project"
        );
      }

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