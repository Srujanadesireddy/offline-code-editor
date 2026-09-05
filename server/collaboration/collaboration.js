const connectedUsers = new Map();

function setupCollaboration(io) {
    io.on("connection", (socket) => {
        console.log(
            "Collaboration client connected:",
            socket.id
        );

        socket.on("join-project", ({ projectId, user }) => {
            if (!projectId) return;

            socket.join(`project:${projectId}`);

            connectedUsers.set(socket.id, {
                socketId: socket.id,
                projectId,
                user: user || {
                    id: "unknown",
                    name: "Anonymous",
                },
            });

            const users = Array.from(
                connectedUsers.values()
            ).filter(
                (item) =>
                    item.projectId === projectId
            );

            io.to(`project:${projectId}`).emit(
                "project-users",
                users
            );

            console.log(
                `User joined project ${projectId}:`,
                socket.id
            );
        });

        socket.on("leave-project", ({ projectId }) => {
            if (!projectId) return;

            socket.leave(`project:${projectId}`);
            connectedUsers.delete(socket.id);

            const users = Array.from(
                connectedUsers.values()
            ).filter(
                (item) =>
                    item.projectId === projectId
            );

            io.to(`project:${projectId}`).emit(
                "project-users",
                users
            );
        });

        // Real-time file changes
        socket.on(
            "file-change",
            ({ projectId, fileId, content }) => {
                if (
                    !projectId ||
                    !fileId
                ) {
                    return;
                }

                socket
                    .to(`project:${projectId}`)
                    .emit(
                        "file-change",
                        {
                            fileId,
                            content,
                        }
                    );
            }
        );

        socket.on("disconnect", () => {
            const user =
                connectedUsers.get(socket.id);

            if (user) {
                const projectId =
                    user.projectId;

                connectedUsers.delete(socket.id);

                const users = Array.from(
                    connectedUsers.values()
                ).filter(
                    (item) =>
                        item.projectId === projectId
                );

                io.to(`project:${projectId}`).emit(
                    "project-users",
                    users
                );
            }

            console.log(
                "Collaboration client disconnected:",
                socket.id
            );
        });
    });
}

module.exports = {
    setupCollaboration,
};