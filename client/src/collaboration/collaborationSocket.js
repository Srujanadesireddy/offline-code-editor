import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const connectCollaboration = () => {
    if (socket) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        autoConnect: true,
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log(
            "Collaboration connected:",
            socket.id
        );
    });

    socket.on("disconnect", (reason) => {
        console.log(
            "Collaboration disconnected:",
            reason
        );
    });

    socket.on("connect_error", (error) => {
        console.warn(
            "Collaboration connection failed:",
            error.message
        );
    });

    return socket;
};

export const getCollaborationSocket = () => {
    return socket;
};

export const disconnectCollaboration = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinProject = (
    projectId,
    user = null
) => {
    if (!socket) {
        return;
    }

    const sendJoin = () => {
        socket.emit("join-project", {
            projectId,
            user,
        });
    };

    if (socket.connected) {
        sendJoin();
    } else {
        socket.once("connect", sendJoin);
    }
};

export const leaveProject = (projectId) => {
    if (!socket?.connected) {
        return;
    }

    socket.emit("leave-project", {
        projectId,
    });
};