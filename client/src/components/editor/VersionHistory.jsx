import { useEffect, useState } from "react";
import axios from "axios";
import { useEditor } from "../../context/EditorContext";

function VersionHistory() {
    const {
        activeFile,
        explorer,
        setFiles,
        editorInstance,
    } = useEditor();

    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);

    const findFile = (nodes) => {
        for (const node of nodes) {
            if (
                node.type === "file" &&
                node.name === activeFile
            ) {
                return node;
            }

            if (node.children) {
                const found = findFile(node.children);

                if (found) {
                    return found;
                }
            }
        }

        return null;
    };

    const activeFileNode = findFile(explorer);
    const fileId = activeFileNode?.id;

    useEffect(() => {
        if (!fileId) {
            setVersions([]);
            return;
        }

        const fetchVersions = async () => {
            if (!navigator.onLine) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/api/files/${fileId}/versions`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setVersions(
                    response.data.versions || []
                );

            } catch (error) {
                console.error(
                    "Failed to fetch versions:",
                    error
                );

                setVersions([]);

            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [fileId]);

    return (
        <div className="h-full w-full border-l bg-white">

            <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">
                    Version History
                </h2>
            </div>

            <div className="p-3">

                {!activeFile && (
                    <p className="text-sm text-gray-500">
                        Select a file to view versions.
                    </p>
                )}

                {loading && (
                    <p className="text-sm text-gray-500">
                        Loading versions...
                    </p>
                )}

                {!loading &&
                    activeFile &&
                    versions.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No versions available.
                        </p>
                    )}

                {!loading &&
                    versions.map((version) => (
                        <div
                            key={version._id}
                            className="mb-2 rounded-md border p-3"
                        >
                            <div className="flex justify-between gap-2">
                                <span className="text-sm font-medium">
                                    Version {version.versionNumber}
                                </span>

                                <span className="text-xs text-gray-500">
                                    {new Date(
                                        version.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                {version.createdBy?.name ||
                                    "Unknown user"}
                            </p>

                            <div className="mt-2 flex gap-2">

                                <button
                                    onClick={() => {
                                        window.alert(
                                            version.content || "(empty file)"
                                        );
                                    }}
                                    className="flex-1 rounded-md bg-slate-700 px-2 py-1.5 text-xs text-white hover:bg-slate-600"
                                >
                                    View
                                </button>

                                <button
                                    onClick={async () => {
                                        const confirmed = window.confirm(
                                            `Restore Version ${version.versionNumber}?`
                                        );

                                        if (!confirmed) return;

                                        try {
                                            const token =
                                                localStorage.getItem("token");

                                            const response = await fetch(
                                                `http://localhost:5000/api/files/${fileId}`,
                                                {
                                                    method: "PUT",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({
                                                        content: version.content || "",
                                                    }),
                                                }
                                            );

                                            const data = await response.json();

                                            if (!data.success) {
                                                throw new Error(
                                                    data.message || "Restore failed"
                                                );
                                            }

                                            window.alert(
                                                `Version ${version.versionNumber} restored successfully.`
                                            );

                                            setFiles((prev) => ({
                                                ...prev,
                                                [activeFile]: version.content || "",
                                            }));

                                            if (editorInstance) {
                                                editorInstance.setValue(
                                                    version.content || ""
                                                );
                                            }

                                            // window.location.reload();

                                        } catch (error) {
                                            console.error(
                                                "Restore version error:",
                                                error
                                            );

                                            window.alert(
                                                error.message || "Unable to restore version"
                                            );
                                        }
                                    }}
                                    className="flex-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs text-white hover:bg-blue-500"
                                >
                                    Restore
                                </button>

                                <button
                                    onClick={async () => {
                                        const confirmed = window.confirm(
                                            `Delete Version ${version.versionNumber}?`
                                        );

                                        if (!confirmed) return;

                                        try {
                                            const token = localStorage.getItem("token");

                                            const response = await fetch(
                                                `http://localhost:5000/api/files/${fileId}/versions/${version._id}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );

                                            const data = await response.json();

                                            if (!data.success) {
                                                throw new Error(
                                                    data.message || "Delete failed"
                                                );
                                            }

                                            setVersions((prev) =>
                                                prev.filter(
                                                    (item) => item._id !== version._id
                                                )
                                            );

                                        } catch (error) {
                                            console.error(
                                                "Delete version error:",
                                                error
                                            );

                                            window.alert(
                                                error.message || "Unable to delete version"
                                            );
                                        }
                                    }}
                                    className="flex-1 rounded-md bg-red-600 px-2 py-1.5 text-xs text-white hover:bg-red-500"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

            </div>
        </div>
    );
}

export default VersionHistory;