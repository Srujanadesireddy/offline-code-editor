import Navbar from "../components/dashboard/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import NewProjectCard from "../components/dashboard/NewProjectCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import Sidebar from "../components/dashboard/Sidebar";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="max-w-7xl mx-auto p-8">

          <WelcomeCard />

          <NewProjectCard />

          <h2 className="text-3xl font-bold text-white mt-12 mb-6">
            Recent Projects
          </h2>

          <ProjectCard
            projectName="ResumeCraft"
            lastEdited="Today"
          />

          <ProjectCard
            projectName="Portfolio"
            lastEdited="Yesterday"
          />

          <ProjectCard
            projectName="DSA.java"
            lastEdited="2 days ago"
          />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;