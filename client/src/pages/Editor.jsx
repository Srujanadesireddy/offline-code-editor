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
    const fetchProjectStructure = async () => {
      try {
        const token = localStorage.getItem("token");

        const [filesResponse, foldersResponse] = await Promise.all([
          fetch(
            `http://localhost:5000/api/files/${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:5000/api/folders/${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const filesData = await filesResponse.json();
        const foldersData = await foldersResponse.json();

        if (!filesData.success || !foldersData.success) {
          console.error(
            "Failed to load project structure"
          );
          return;
        }

        const root = {
          id: "root",
          name: "Project",
          type: "folder",
          children: [],
        };

        // -------------------------
        // Create folder nodes
        // -------------------------

        const folderMap = {};

        foldersData.folders.forEach((folder) => {
          folderMap[folder._id] = {
            id: folder._id,
            name: folder.name,
            type: "folder",
            children: [],
          };
        });

        // -------------------------
        // Build folder hierarchy
        // -------------------------

        foldersData.folders.forEach((folder) => {
          const currentFolder = folderMap[folder._id];

          if (folder.parent) {
            const parentFolder =
              folderMap[folder.parent];

            if (parentFolder) {
              parentFolder.children.push(
                currentFolder
              );
            }
          } else {
            root.children.push(
              currentFolder
            );
          }
        });

        // -------------------------
        // Add files to correct folder
        // -------------------------

        filesData.files.forEach((file) => {
          const fileNode = {
            id: file._id,
            name: file.name,
            type: "file",
          };

          if (file.folder) {
            const folderId =
              file.folder.toString();

            const parentFolder =
              folderMap[folderId];

            if (parentFolder) {
              parentFolder.children.push(
                fileNode
              );
            } else {
              root.children.push(
                fileNode
              );
            }
          } else {
            // Existing files without a folder
            root.children.push(
              fileNode
            );
          }
        });

        setExplorer([root]);

      } catch (error) {
        console.error(
          "Failed to load project structure:",
          error
        );
      }
    };

    fetchProjectStructure();
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