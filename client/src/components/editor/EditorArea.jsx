import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import Breadcrumb from "./Breadcrumb";

function EditorArea() {
  return (
    <div className="flex-1 flex flex-col">
      <EditorTabs />

      <div className="flex-1">
        <Breadcrumb />
        <CodeEditor />
      </div>
    </div>
  );
}

export default EditorArea;