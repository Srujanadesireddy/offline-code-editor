import {
    getOperations,
    deleteOperation,
    saveProject,
    saveFolder,
    saveFile,
} from "../database/indexedDB";

const API_URL = "http://localhost:5000";

// Prevent two sync processes from running at the same time
let isSyncing = false;


// ======================================================
// INTERNET STATUS
// ======================================================

export const isOnline = () => {
    return navigator.onLine;
};


// ======================================================
// GET AUTH TOKEN
// ======================================================

const getToken = () => {
    return localStorage.getItem("token");
};


// ======================================================
// LOCAL ID → SERVER ID MAP
// ======================================================

const idMap = new Map();

const resolveId = (id) => {
    return idMap.get(id) || id;
};


// ======================================================
// API REQUEST HELPER
// ======================================================

const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
};


// ======================================================
// EXTRACT SERVER ENTITY
// ======================================================

const extractEntity = (response, possibleKeys = []) => {
    if (!response) return null;

    for (const key of possibleKeys) {
        if (response[key]) {
            return response[key];
        }
    }

    return (
        response.project ||
        response.folder ||
        response.file ||
        response.data ||
        null
    );
};


// ======================================================
// CREATE PROJECT
// ======================================================

const syncCreateProject = async (operation) => {
    const response = await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({
            name: operation.data?.name,
            description: operation.data?.description || "",
        }),
    });

    const project = extractEntity(response, [
        "project",
        "data",
    ]);

    if (!project) {
        throw new Error(
            "Server did not return created project"
        );
    }

    const serverId =
        project._id || project.id;

    if (!serverId) {
        throw new Error(
            "Created project has no server ID"
        );
    }

    idMap.set(
        operation.entityId,
        serverId
    );

    await saveProject({
        ...project,
        _id: serverId,
        id: serverId,
    });

    console.log(
        `Project synced: ${operation.entityId} → ${serverId}`
    );

    return project;
};


// ======================================================
// DELETE PROJECT
// ======================================================

const syncDeleteProject = async (operation) => {
    const projectId = resolveId(
        operation.entityId
    );

    if (projectId.startsWith("local-")) {
        console.log(
            "Skipping server delete for local-only project:",
            projectId
        );

        return;
    }

    await apiRequest(
        `/api/projects/${projectId}`,
        {
            method: "DELETE",
        }
    );

    console.log(
        "Project deleted on server:",
        projectId
    );
};


// ======================================================
// CREATE FOLDER
// ======================================================

const syncCreateFolder = async (operation) => {
    const projectId = resolveId(
        operation.projectId
    );

    const parentId = operation.parentId
        ? resolveId(operation.parentId)
        : operation.data?.parentId
            ? resolveId(operation.data.parentId)
            : null;

    if (projectId.startsWith("local-")) {
        throw new Error(
            `Project ${projectId} has not been synced yet`
        );
    }

    const response = await apiRequest(
        "/api/folders",
        {
            method: "POST",
            body: JSON.stringify({
                name: operation.data?.name,
                projectId: projectId,
                parent: parentId,
            }),
        }
    );

    const folder = extractEntity(
        response,
        [
            "folder",
            "data",
        ]
    );

    if (!folder) {
        throw new Error(
            "Server did not return created folder"
        );
    }

    const serverId =
        folder._id || folder.id;

    if (!serverId) {
        throw new Error(
            "Created folder has no server ID"
        );
    }

    idMap.set(
        operation.entityId,
        serverId
    );

    await saveFolder({
        ...folder,
        _id: serverId,
        id: serverId,
        projectId,
        parentId,
    });

    console.log(
        `Folder synced: ${operation.entityId} → ${serverId}`
    );

    return folder;
};


// ======================================================
// DELETE FOLDER
// ======================================================

const syncDeleteFolder = async (operation) => {
    const folderId = resolveId(
        operation.entityId
    );

    if (folderId.startsWith("local-")) {
        console.log(
            "Skipping server delete for local-only folder:",
            folderId
        );

        return;
    }

    await apiRequest(
        `/api/folders/${folderId}`,
        {
            method: "DELETE",
        }
    );

    console.log(
        "Folder deleted on server:",
        folderId
    );
};


// ======================================================
// RENAME FOLDER
// ======================================================

const syncRenameFolder = async (operation) => {
    const folderId = resolveId(
        operation.entityId
    );

    if (folderId.startsWith("local-")) {
        console.log(
            "Skipping rename for local-only folder:",
            folderId
        );

        return;
    }

    await apiRequest(
        `/api/folders/${folderId}/rename`,
        {
            method: "PUT",
            body: JSON.stringify({
                name: operation.data?.newName,
            }),
        }
    );

    console.log(
        "Folder renamed on server:",
        folderId
    );
};


// ======================================================
// CREATE FILE
// ======================================================

const syncCreateFile = async (operation) => {
    const projectId = resolveId(
        operation.projectId
    );

    const folderId = operation.folderId
        ? resolveId(operation.folderId)
        : operation.data?.folderId
            ? resolveId(operation.data.folderId)
            : null;

    if (projectId.startsWith("local-")) {
        throw new Error(
            `Project ${projectId} has not been synced yet`
        );
    }

    if (
        folderId &&
        folderId.startsWith("local-")
    ) {
        throw new Error(
            `Folder ${folderId} has not been synced yet`
        );
    }

    const response = await apiRequest(
        "/api/files",
        {
            method: "POST",
            body: JSON.stringify({
                name: operation.data?.name,
                language:
                    operation.data?.language || "javascript",
                projectId: projectId,
                folderId: folderId,
            }),
        }
    );

    const file = extractEntity(
        response,
        [
            "file",
            "data",
        ]
    );

    if (!file) {
        throw new Error(
            "Server did not return created file"
        );
    }

    const serverId =
        file._id || file.id;

    if (!serverId) {
        throw new Error(
            "Created file has no server ID"
        );
    }

    idMap.set(
        operation.entityId,
        serverId
    );

    await saveFile({
        ...file,
        _id: serverId,
        id: serverId,
        projectId,
        folderId,
    });

    console.log(
        `File synced: ${operation.entityId} → ${serverId}`
    );

    return file;
};


// ======================================================
// DELETE FILE
// ======================================================

const syncDeleteFile = async (operation) => {
    const fileId = resolveId(
        operation.entityId
    );

    if (fileId.startsWith("local-")) {
        console.log(
            "Skipping server delete for local-only file:",
            fileId
        );

        return;
    }

    await apiRequest(
        `/api/files/${fileId}`,
        {
            method: "DELETE",
        }
    );

    console.log(
        "File deleted on server:",
        fileId
    );
};


// ======================================================
// RENAME FILE
// ======================================================

const syncRenameFile = async (operation) => {
    const fileId = resolveId(
        operation.entityId
    );

    if (fileId.startsWith("local-")) {
        console.log(
            "Skipping rename for local-only file:",
            fileId
        );

        return;
    }

    await apiRequest(
        `/api/files/${fileId}/rename`,
        {
            method: "PUT",
            body: JSON.stringify({
                name: operation.data?.newName,
            }),
        }
    );

    console.log(
        "File renamed on server:",
        fileId
    );
};


// ======================================================
// MOVE FILE
// ======================================================

const syncMoveFile = async (operation) => {
    const fileId = resolveId(
        operation.entityId
    );

    const folderId =
        operation.data?.folderId
            ? resolveId(
                operation.data.folderId
            )
            : null;

    if (fileId.startsWith("local-")) {
        console.log(
            "Skipping move for local-only file:",
            fileId
        );

        return;
    }

    if (
        folderId &&
        folderId.startsWith("local-")
    ) {
        throw new Error(
            `Folder ${folderId} has not been synced yet`
        );
    }

    await apiRequest(
        `/api/files/${fileId}/move`,
        {
            method: "PUT",
            body: JSON.stringify({
                folderId: folderId,
            }),
        }
    );

    console.log(
        "File moved on server:",
        fileId
    );
};


// ======================================================
// UPDATE FILE
// ======================================================

const syncUpdateFile = async (operation) => {
    const fileId = resolveId(
        operation.entityId
    );

    if (fileId.startsWith("local-")) {
        throw new Error(
            `File ${fileId} has not been synced yet`
        );
    }

    const response = await apiRequest(
        `/api/files/${fileId}`,
        {
            method: "PUT",
            body: JSON.stringify({
                content: operation.data?.content ?? "",
            }),
        }
    );

    console.log(
        "File updated on server:",
        fileId
    );

    return response;
};


// ======================================================
// PROCESS ONE OPERATION
// ======================================================

const processOperation = async (operation) => {
    console.log(
        "Processing operation:",
        operation
    );

    switch (operation.type) {

        case "CREATE_PROJECT":
            return await syncCreateProject(
                operation
            );

        case "DELETE_PROJECT":
            return await syncDeleteProject(
                operation
            );

        case "CREATE_FOLDER":
            return await syncCreateFolder(
                operation
            );

        case "DELETE_FOLDER":
            return await syncDeleteFolder(
                operation
            );

        case "RENAME_FOLDER":
            return await syncRenameFolder(
                operation
            );

        case "CREATE_FILE":
            return await syncCreateFile(
                operation
            );

        case "DELETE_FILE":
            return await syncDeleteFile(
                operation
            );

        case "RENAME_FILE":
            return await syncRenameFile(
                operation
            );

        case "MOVE_FILE":
            return await syncMoveFile(
                operation
            );

        case "UPDATE_FILE":
            return await syncUpdateFile(
                operation
            );

        default:
            throw new Error(
                `Unknown operation type: ${operation.type}`
            );
    }
};


// ======================================================
// SYNC PENDING OPERATIONS
// ======================================================

export const syncPendingOperations = async () => {

    // Prevent duplicate sync calls
    if (isSyncing) {
        console.log(
            "Sync already in progress. Skipping."
        );

        return;
    }

    if (!isOnline()) {
        console.log(
            "Offline. Sync skipped."
        );

        return;
    }

    const token = getToken();

    if (!token) {
        console.warn(
            "No authentication token. Sync skipped."
        );

        return;
    }

    isSyncing = true;

    try {

        const operations =
            await getOperations();

        if (
            !operations ||
            operations.length === 0
        ) {
            console.log(
                "No pending operations."
            );

            return;
        }

        console.log(
            `Found ${operations.length} pending operation(s).`
        );

        for (const operation of operations) {

            try {

                await processOperation(
                    operation
                );

                await deleteOperation(
                    operation.id
                );

                console.log(
                    "Operation synced and removed:",
                    operation.id,
                    operation.type
                );

            } catch (error) {

                console.error(
                    "Operation failed:",
                    operation,
                    error
                );

                break;
            }
        }

    } catch (error) {

        console.error(
            "Sync engine error:",
            error
        );

    } finally {

        isSyncing = false;
    }
};


// ======================================================
// START SYNC ENGINE
// ======================================================

export const startSyncEngine = () => {

    console.log(
        "Sync Engine started."
    );

    if (navigator.onLine) {
        syncPendingOperations();
    }

    window.addEventListener(
        "online",
        syncPendingOperations
    );
};


// ======================================================
// STOP SYNC ENGINE
// ======================================================

export const stopSyncEngine = () => {

    window.removeEventListener(
        "online",
        syncPendingOperations
    );

    console.log(
        "Sync Engine stopped."
    );
};