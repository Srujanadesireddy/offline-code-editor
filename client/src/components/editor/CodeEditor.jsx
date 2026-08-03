import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useEditor } from "../../context/EditorContext";
import toast from "react-hot-toast";

function CodeEditor() {
    const {
        activeFile,
        files,
        setFiles,
        dirtyFiles,
        setDirtyFiles,
        // saveStatus,
        setSaveStatus,
    } = useEditor();

    const timer = useRef(null);

    useEffect(() => {
        const handleSave = (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();

                setDirtyFiles((prev) =>
                    prev.filter((file) => file !== activeFile)
                );

                setSaveStatus("Saved");
            }
        };

        window.addEventListener("keydown", handleSave);

        return () => {
            window.removeEventListener("keydown", handleSave);
            clearTimeout(timer.current);
        };
    }, [activeFile, setDirtyFiles, setSaveStatus]);

    return (
        <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            path={activeFile}
            value={files[activeFile]}
            onChange={(value) => {
                setFiles((prev) => ({
                    ...prev,
                    [activeFile]: value,
                }));

                if (!dirtyFiles.includes(activeFile)) {
                    setDirtyFiles((prev) => [...prev, activeFile]);
                }

                setSaveStatus("Unsaved");

                clearTimeout(timer.current);

                timer.current = setTimeout(() => {
                    setDirtyFiles((prev) =>
                        prev.filter((file) => file !== activeFile)
                    );

                    setSaveStatus("Saved");

                    toast.success("Auto Saved");
                }, 2000);
            }}
        />
    );
}

export default CodeEditor;