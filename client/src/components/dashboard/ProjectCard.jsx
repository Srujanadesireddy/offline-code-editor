import { FolderKanban, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProjectCard({ projectId, projectName, lastEdited }) {
  const navigate = useNavigate();

  const openProject = () => {
    navigate(`/editor/${projectId}`);
  };

  const deleteProject = async () => {

    const confirmDelete = window.confirm(
      "Delete this project?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {
      window.location.reload();
    }
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">

          <div className="bg-blue-100 p-3 rounded-xl">
            <FolderKanban className="text-blue-600" size={24} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {projectName}
            </h3>

            <p className="text-slate-500">
              Last edited: {lastEdited}
            </p>

            <div className="flex gap-2 mt-2">
              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
                React
              </span>

              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
                Tailwind
              </span>
            </div>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            onClick={deleteProject}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
          >
            <Trash2 size={18} className="text-white" />
          </button>

          <button
            onClick={openProject}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Open →
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProjectCard;