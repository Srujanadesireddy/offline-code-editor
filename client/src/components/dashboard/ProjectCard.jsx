import {
  FolderKanban,
  Trash2,
  Clock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  deleteProject as deleteProjectFromIndexedDB,
  addOperation,
} from "../../database/indexedDB";

function ProjectCard({
  project,
  onDeleted,
}) {
  const navigate = useNavigate();

  if (!project) {
    return null;
  }

  const projectId =
    project._id || project.id;

  const openProject = () => {
    navigate(`/editor/${projectId}`);
  };

  const deleteProject = async () => {
    const confirmDelete = window.confirm(
      `Delete "${project.name}"?\n\nThis will also delete its files and folders.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
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
            "Failed to delete project"
        );
      }

      // Remove from IndexedDB
      await deleteProjectFromIndexedDB(
        projectId
      );

      toast.success(
        "Project deleted successfully"
      );

      onDeleted?.(projectId);

    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      // OFFLINE DELETE
      try {
        await deleteProjectFromIndexedDB(
          projectId
        );

        await addOperation({
          type: "DELETE_PROJECT",
          entityId: projectId,
          projectId: projectId,

          data: {
            name: project.name,
          },
        });

        onDeleted?.(projectId);

        toast.success(
          "Project deleted offline"
        );

      } catch (offlineError) {
        console.error(
          "Offline project deletion error:",
          offlineError
        );

        toast.error(
          "Unable to delete project"
        );
      }
    }
  };

  const lastEdited =
    project.updatedAt
      ? new Date(
          project.updatedAt
        ).toLocaleDateString()
      : "Unknown";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        {/* Project Information */}

        <div className="flex items-center gap-4">

          <div className="bg-blue-100 p-3 rounded-xl">

            <FolderKanban
              size={24}
              className="text-blue-600"
            />

          </div>

          <div>

            <h3 className="text-xl font-bold text-slate-800">
              {project.name}
            </h3>

            <p className="text-slate-500 flex items-center gap-1 mt-1">

              <Clock size={14} />

              Last edited: {lastEdited}

            </p>

            {project.description && (
              <p className="text-sm text-slate-400 mt-1">
                {project.description}
              </p>
            )}

          </div>

        </div>

        {/* Actions */}

        <div className="flex items-center gap-3">

          <button
            onClick={deleteProject}
            title="Delete project"
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
          >

            <Trash2
              size={18}
              className="text-white"
            />

          </button>

          <button
            onClick={openProject}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Open →
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProjectCard;