const Project = require("../models/Project");

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