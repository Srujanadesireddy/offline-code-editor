import { ChevronRight } from "lucide-react";
import { useEditor } from "../../context/EditorContext";

function Breadcrumb() {
    const { activeFile, explorer } = useEditor();

    const findPath = (nodes, targetName, path = []) => {
        for (const node of nodes) {

            if (node.name === targetName) {
                return [...path, node.name];
            }

            if (node.children && node.children.length > 0) {
                const result = findPath(
                    node.children,
                    targetName,
                    [...path, node.name]
                );

                if (result) {
                    return result;
                }
            }
        }

        return null;
    };

    const filePath = activeFile
        ? findPath(explorer, activeFile)
        : null;

    const path = filePath || ["Project", activeFile];

    return (
        <div className="h-10 flex items-center px-4 bg-slate-900 border-b border-slate-700 text-sm text-slate-300">

            {path.map((item, index) => (
                <div
                    key={`${item}-${index}`}
                    className="flex items-center"
                >
                    {index > 0 && (
                        <ChevronRight
                            size={16}
                            className="mx-2"
                        />
                    )}

                    <span
                        className={
                            index === path.length - 1
                                ? "text-white"
                                : ""
                        }
                    >
                        {item}
                    </span>
                </div>
            ))}

        </div>
    );
}

export default Breadcrumb;