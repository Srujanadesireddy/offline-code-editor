import { FolderKanban } from "lucide-react";
function ProjectCard({ projectName, lastEdited }) {
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

        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
          Open →
        </button>

      </div>
    </div>
  );
}

      export default ProjectCard;