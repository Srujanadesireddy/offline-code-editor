import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditor } from "../context/EditorContext";
import TopBar from "../components/editor/TopBar";
import Explorer from "../components/editor/Explorer";
import EditorArea from "../components/editor/EditorArea";
import StatusBar from "../components/editor/StatusBar";
import ActivityBar from "../components/editor/ActivityBar";
import SearchPanel from "../components/editor/SearchPanel";
import SettingsPanel from "../components/editor/SettingsPanel";
import ProfilePanel from "../components/editor/ProfilePanel";

function Editor() {
  const { projectId } = useParams();

  const { setExplorer } = useEditor();

  console.log("Project ID:", projectId);

  const [activePanel, setActivePanel] = useState("explorer");

  useEffect(() => {

    const fetchFiles = async () => {

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/files/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.success) {

        const explorerData = [
          {
            id: "root",
            name: "Project",
            type: "folder",
            children: [],
          },
        ];

        data.files.forEach((file) => {
          explorerData[0].children.push({
            id: file._id,
            name: file.name,
            type: "file",
          });
        });

        setExplorer(explorerData);

      }

    };

    fetchFiles();

  }, [projectId, setExplorer]);

  return (
    <div className="h-screen flex flex-col">

      <TopBar />

      <div className="flex flex-1">

        <ActivityBar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />

        {activePanel === "explorer" && <Explorer />}

        {activePanel === "search" && <SearchPanel />}

        {activePanel === "git" && (
          <div className="w-72 bg-slate-900 text-white p-4">
            🌿 Git Panel
          </div>
        )}

        {activePanel === "run" && (
          <div className="w-72 bg-slate-900 text-white p-4">
            ▶ Run Panel
          </div>
        )}

        {activePanel === "debug" && (
          <div className="w-72 bg-slate-900 text-white p-4">
            🐞 Debug Panel
          </div>
        )}

        {activePanel === "settings" && <SettingsPanel />}

        {activePanel === "profile" && <ProfilePanel />}
        <EditorArea />

      </div>

      <StatusBar />

    </div>
  );
}

export default Editor;