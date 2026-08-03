import { useState } from "react";
import TopBar from "../components/editor/TopBar";
import Explorer from "../components/editor/Explorer";
import EditorArea from "../components/editor/EditorArea";
import StatusBar from "../components/editor/StatusBar";
import ActivityBar from "../components/editor/ActivityBar";
import SearchPanel from "../components/editor/SearchPanel";
import SettingsPanel from "../components/editor/SettingsPanel";
import ProfilePanel from "../components/editor/ProfilePanel";

function Editor() {
  const [activePanel, setActivePanel] = useState("explorer");
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