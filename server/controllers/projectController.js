const Project = require("../models/Project");
const File = require("../models/File");

exports.createProject = async (req, res) => {
    try {

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Project name is required",
            });
        }

        const project = await Project.create({
            name,
            description,
            owner: req.user.id,
        });

        // Create default project files
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

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.getProjects = async (req, res) => {
    try {

        const projects = await Project.find({
            owner: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            projects,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.deleteProject = async (req, res) => {
    try {

        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};