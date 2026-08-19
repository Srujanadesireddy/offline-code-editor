import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import Breadcrumb from "./Breadcrumb";

function EditorArea() {
  return (
    <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-[#1e1e1e]">

      <div className="flex-shrink-0">
        <EditorTabs />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">

        <div className="flex-shrink-0">
          <Breadcrumb />
        </div>

        <div className="flex-1 min-h-0 h-full">
          <CodeEditor />
        </div>

      </div>

    </div>
  );
}

export default EditorArea;