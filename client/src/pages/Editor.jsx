import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditor } from "../context/EditorContext";
import VersionHistory from "../components/editor/VersionHistory";
import {
  saveFolder,
  saveFile,
  getFoldersByProject,
  getFilesByProject,
} from "../database/indexedDB";
import {
  connectCollaboration,
  disconnectCollaboration,
  joinProject,
  leaveProject,
} from "../collaboration/collaborationSocket";

import TopBar from "../components/editor/TopBar";
import Explorer from "../components/editor/Explorer";
import EditorArea from "../components/editor/EditorArea";
import StatusBar from "../components/editor/StatusBar";
import ActivityBar from "../components/editor/ActivityBar";
import SearchPanel from "../components/editor/SearchPanel";
import GitPanel from "../components/editor/GitPanel";
import RunPanel from "../components/editor/RunPanel";
import DebugPanel from "../components/editor/DebugPanel";
import SettingsPanel from "../components/editor/SettingsPanel";
import ProfilePanel from "../components/editor/ProfilePanel";
import TerminalPanel from "../components/editor/TerminalPanel";

function Editor() {
  const { projectId } = useParams();

  const { setExplorer } = useEditor();

  const [activePanel, setActivePanel] =
    useState("explorer");

  const [showTerminal, setShowTerminal] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [connectedUsers, setConnectedUsers] =
    useState([]);

  useEffect(() => {
    if (!projectId) return;

    const socket = connectCollaboration();

    const handleProjectUsers = (users) => {
      setConnectedUsers(users || []);
    };

    socket.on(
      "project-users",
      handleProjectUsers
    );

    const handleConnect = () => {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const user = {
        id: storedUser._id || storedUser.id || "unknown",
        name: storedUser.name || storedUser.username || "User",
      };

      joinProject(projectId, user);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      leaveProject(projectId);

      socket.off(
        "project-users",
        handleProjectUsers
      );

      socket.off("connect", handleConnect);

      disconnectCollaboration();

      setConnectedUsers([]);
    };
  }, [projectId]);


  useEffect(() => {
    const fetchProjectStructure = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const [
          filesResponse,
          foldersResponse,
        ] = await Promise.all([
          fetch(
            `http://localhost:5000/api/files/${projectId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:5000/api/folders/${projectId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),
        ]);


        const filesData =
          await filesResponse.json();

        const foldersData =
          await foldersResponse.json();


        if (
          !filesData.success ||
          !foldersData.success
        ) {
          console.error(
            "Failed to load project structure"
          );

          return;
        }

        // Save folders to IndexedDB
        for (const folder of foldersData.folders) {
          await saveFolder({
            id: folder._id,
            name: folder.name,
            projectId: folder.project,
            parentId: folder.parent,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
          });
        }

        // Save files to IndexedDB
        for (const file of filesData.files) {
          await saveFile({
            id: file._id,
            name: file.name,
            content: file.content || "",
            language: file.language,
            projectId: file.project,
            folderId: file.folder,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          });
        }


        const root = {
          id: "root",
          name: "Project",
          type: "folder",
          children: [],
        };


        /*
         * Create folder nodes
         */

        const folderMap = {};


        foldersData.folders.forEach(
          (folder) => {
            folderMap[folder._id] = {
              id: folder._id,
              name: folder.name,
              type: "folder",
              children: [],
            };
          }
        );


        /*
         * Build folder hierarchy
         */

        foldersData.folders.forEach(
          (folder) => {
            const currentFolder =
              folderMap[folder._id];

            if (folder.parent) {

              const parentFolder =
                folderMap[
                folder.parent
                ];

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
          }
        );


        /*
         * Add files
         */

        filesData.files.forEach(
          (file) => {

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

              root.children.push(
                fileNode
              );

            }

          }
        );


        setExplorer([root]);

      } catch (error) {

        console.warn(
          "Backend unavailable. Loading project structure from IndexedDB..."
        );

        try {

          const [
            localFolders,
            localFiles,
          ] = await Promise.all([
            getFoldersByProject(projectId),
            getFilesByProject(projectId),
          ]);

          console.log(
            "Offline folders:",
            localFolders
          );

          console.log(
            "Offline files:",
            localFiles
          );


          const root = {
            id: "root",
            name: "Project",
            type: "folder",
            children: [],
          };


          /*
           * Create folder nodes
           */

          const folderMap = {};


          localFolders.forEach(
            (folder) => {

              folderMap[folder.id] = {
                id: folder.id,
                name: folder.name,
                type: "folder",
                children: [],
              };

            }
          );


          /*
           * Build folder hierarchy
           */

          localFolders.forEach(
            (folder) => {

              const currentFolder =
                folderMap[folder.id];


              if (folder.parentId) {

                const parentFolder =
                  folderMap[
                  folder.parentId
                  ];


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

            }
          );


          /*
           * Add files
           */

          localFiles.forEach(
            (file) => {

              const fileNode = {
                id: file.id,
                name: file.name,
                type: "file",
              };


              if (file.folderId) {

                const parentFolder =
                  folderMap[
                  file.folderId
                  ];


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

                root.children.push(
                  fileNode
                );

              }

            }
          );


          setExplorer([root]);

          console.log(
            "Project structure loaded from IndexedDB"
          );

        } catch (offlineError) {

          console.error(
            "Failed to load project structure from IndexedDB:",
            offlineError
          );

        }

      }
    };


    fetchProjectStructure();

  }, [projectId, setExplorer]);


  const handlePanelChange = (
    panel
  ) => {

    setShowTerminal(false);

    setActivePanel(panel);

  };


  const handleTerminalToggle = () => {

    setShowTerminal(
      (prev) => !prev
    );

  };


  return (
    <div className="h-screen flex flex-col">

      <TopBar
        activePanel={activePanel}
        setActivePanel={handlePanelChange}
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        onTerminalToggle={handleTerminalToggle}
        projectId={projectId}
        connectedUsers={connectedUsers}
        onHistoryToggle={() => setShowHistory((prev) => !prev)}
      />


      <div className="flex flex-1 min-h-0">

        <ActivityBar
          activePanel={
            activePanel
          }
          setActivePanel={
            handlePanelChange
          }
        />


        {activePanel ===
          "explorer" && (
            <Explorer />
          )}


        {activePanel ===
          "search" && (
            <SearchPanel />
          )}


        {activePanel ===
          "git" && (
            <GitPanel />
          )}


        {activePanel ===
          "run" && (
            <RunPanel />
          )}


        {activePanel ===
          "debug" && (
            <DebugPanel />
          )}


        {activePanel ===
          "settings" && (
            <SettingsPanel />
          )}


        {activePanel ===
          "profile" && (
            <ProfilePanel />
          )}


        <div className="flex-1 min-w-0 min-h-0 flex flex-col">

          <div className="flex-1 min-h-0 flex">
            <div className="flex-1 min-w-0">
              <EditorArea projectId={projectId} />
            </div>

            {showHistory && (
              <div className="w-72 flex-shrink-0">
                <VersionHistory />
              </div>
            )}
          </div>


          {showTerminal && (
            <div className="h-64 flex-shrink-0">
              <TerminalPanel
                onClose={() =>
                  setShowTerminal(false)
                }
              />
            </div>
          )}

        </div>

      </div>


      <StatusBar />

    </div>
  );
}

export default Editor;