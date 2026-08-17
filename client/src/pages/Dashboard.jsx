import { useEffect, useState } from "react";

import Navbar from "../components/dashboard/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import NewProjectCard from "../components/dashboard/NewProjectCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import Sidebar from "../components/dashboard/Sidebar";

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {

    const fetchProjects = async () => {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log(data);

      if (data.success) {
        setProjects(data.projects);
      }
    };

    fetchProjects();

  }, []);

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

          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              projectId={project._id}
              projectName={project.name}
              lastEdited={new Date(project.updatedAt).toLocaleDateString()}
            />
          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;