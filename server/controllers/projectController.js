const Project = require("../models/Project");
const File = require("../models/File");
const Folder = require("../models/Folder");
const crypto = require("crypto");

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project name is required",
            });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description || "",
            owner: req.user.id,
        });

        await File.insertMany([
            {
                name: "App.jsx",
                language: "javascript",
                content: `function App() {
  return (
    <h1>Hello World</h1>
  );
}

export default App;`,
                project: project._id,
            },
            {
                name: "main.jsx",
                language: "javascript",
                content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);`,
                project: project._id,
            },
            {
                name: "index.css",
                language: "css",
                content: `body {
  margin: 0;
  font-family: sans-serif;
}`,
                project: project._id,
            },
        ]);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });

    } catch (error) {
        console.error(
            "Create project error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { members: req.user.id },
            ],
        }).sort({
            updatedAt: -1,
        });

        res.status(200).json({
            success: true,
            projects,
        });

    } catch (error) {
        console.error(
            "Get projects error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Delete all files belonging to the project
        await File.deleteMany({
            project: project._id,
        });

        // Delete all folders belonging to the project
        await Folder.deleteMany({
            project: project._id,
        });

        // Delete the project itself
        await Project.deleteOne({
            _id: project._id,
        });

        res.status(200).json({
            success: true,
            message:
                "Project and its files/folders deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete project error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.shareProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found or you are not the owner",
            });
        }

        if (!project.inviteCode) {
            project.inviteCode = crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase();

            await project.save();
        }

        res.status(200).json({
            success: true,
            inviteCode: project.inviteCode,
            project: {
                id: project._id,
                name: project.name,
            },
        });

    } catch (error) {
        console.error("Share project error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.joinProject = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                message: "Invite code is required",
            });
        }

        const project = await Project.findOne({
            inviteCode: inviteCode.trim().toUpperCase(),
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Invalid invite code",
            });
        }

        const userId = req.user.id.toString();

        const isOwner =
            project.owner.toString() === userId;

        const alreadyMember =
            project.members.some(
                (member) =>
                    member.toString() === userId
            );

        if (!isOwner && !alreadyMember) {
            project.members.push(req.user.id);
            await project.save();
        }

        res.status(200).json({
            success: true,
            message: isOwner
                ? "You are the project owner"
                : "Joined project successfully",
            project,
        });

    } catch (error) {
        console.error("Join project error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};