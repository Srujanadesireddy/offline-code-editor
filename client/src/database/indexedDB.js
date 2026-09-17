const DB_NAME = "CodeSyncDB";
const DB_VERSION = 2;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("projects")) {
                db.createObjectStore("projects", {
                    keyPath: "id",
                });
            }

            if (!db.objectStoreNames.contains("folders")) {
                db.createObjectStore("folders", {
                    keyPath: "id",
                });
            }

            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", {
                    keyPath: "id",
                });
            }

            // Store offline operations for future sync
            if (!db.objectStoreNames.contains("operations")) {
                db.createObjectStore("operations", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// ======================================================
// PROJECTS
// ======================================================

// Save a project
export const saveProject = async (project) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "projects",
            "readwrite"
        );

        const store =
            transaction.objectStore("projects");

        const request = store.put(project);

        request.onsuccess = () => {
            resolve(project);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get all projects
export const getProjects = async () => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "projects",
            "readonly"
        );

        const store =
            transaction.objectStore("projects");

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Delete project
export const deleteProject = async (projectId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "projects",
            "readwrite"
        );

        const store =
            transaction.objectStore("projects");

        const request = store.delete(projectId);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// ======================================================
// FOLDERS
// ======================================================

// Save a folder
export const saveFolder = async (folder) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "folders",
            "readwrite"
        );

        const store =
            transaction.objectStore("folders");

        const request = store.put(folder);

        request.onsuccess = () => {
            resolve(folder);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get folder by ID
export const getFolderById = async (folderId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "folders",
            "readonly"
        );

        const store =
            transaction.objectStore("folders");

        const request = store.get(folderId);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Delete folder
export const deleteFolder = async (folderId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "folders",
            "readwrite"
        );

        const store =
            transaction.objectStore("folders");

        const request = store.delete(folderId);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get folders for project
export const getFoldersByProject = async (projectId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "folders",
            "readonly"
        );

        const store =
            transaction.objectStore("folders");

        const request = store.getAll();

        request.onsuccess = () => {
            const folders =
                request.result.filter(
                    (folder) =>
                        folder.projectId === projectId
                );

            resolve(folders);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// ======================================================
// FILES
// ======================================================

// Save a file
export const saveFile = async (file) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "files",
            "readwrite"
        );

        const store =
            transaction.objectStore("files");

        const request = store.put(file);

        request.onsuccess = () => {
            resolve(file);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get all files
export const getFiles = async () => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "files",
            "readonly"
        );

        const store =
            transaction.objectStore("files");

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get file by ID
export const getFileById = async (fileId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "files",
            "readonly"
        );

        const store =
            transaction.objectStore("files");

        const request = store.get(fileId);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Delete file
export const deleteFile = async (fileId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "files",
            "readwrite"
        );

        const store =
            transaction.objectStore("files");

        const request = store.delete(fileId);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get files for project
export const getFilesByProject = async (projectId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "files",
            "readonly"
        );

        const store =
            transaction.objectStore("files");

        const request = store.getAll();

        request.onsuccess = () => {
            const files =
                request.result.filter(
                    (file) =>
                        file.projectId === projectId
                );

            resolve(files);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// ======================================================
// OFFLINE OPERATIONS QUEUE
// ======================================================

// Add an offline operation
export const addOperation = async (operation) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "operations",
            "readwrite"
        );

        const store =
            transaction.objectStore("operations");

        const request = store.add({
            ...operation,
            createdAt: new Date().toISOString(),
        });

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Get all pending operations
export const getOperations = async () => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "operations",
            "readonly"
        );

        const store =
            transaction.objectStore("operations");

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Delete completed operation
export const deleteOperation = async (operationId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "operations",
            "readwrite"
        );

        const store =
            transaction.objectStore("operations");

        const request =
            store.delete(operationId);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


// Update an existing offline operation
export const updateOperation = async (operation) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "operations",
            "readwrite"
        );

        const store =
            transaction.objectStore("operations");

        const request = store.put(operation);

        request.onsuccess = () => {
            resolve(operation);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};