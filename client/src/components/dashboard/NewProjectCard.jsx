import { Plus } from "lucide-react";

function NewProjectCard() {
  return (
    <div className="mt-8">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]">

        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-5 rounded-full">
            <Plus size={36} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white">
          Start a New Project
        </h2>

        <p className="text-slate-400 mt-3 max-w-lg mx-auto">
          Create a collaborative coding workspace and start building with your
          team in seconds.
        </p>

        <button className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
          + Create Project
        </button>

      </div>

    </div>
  );
}

export default NewProjectCard;