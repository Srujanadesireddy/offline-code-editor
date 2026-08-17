const Folder = require("../models/Folder");

exports.createFolder = async (req, res) => {
    try {
        const { name, projectId, parent } = req.body;

        if (!name || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Folder name and project are required",
            });
        }

        const existingFolder = await Folder.findOne({
            name,
            project: projectId,
            parent: parent || null,
        });

        if (existingFolder) {
            return res.status(400).json({
                success: false,
                message: "Folder already exists",
            });
        }

        const folder = await Folder.create({
            name,
            project: projectId,
            parent: parent || null,
        });

        res.status(201).json({
            success: true,
            message: "Folder created successfully",
            folder,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const folders = await Folder.find({
            project: req.params.projectId,
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            folders,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Folder name is required",
            });
        }

        const folder = await Folder.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Folder renamed successfully",
            folder,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;

        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        // Delete all nested folders
        const deleteChildren = async (parentId) => {
            const children = await Folder.find({
                parent: parentId,
            });

            for (const child of children) {
                await deleteChildren(child._id);
                await Folder.findByIdAndDelete(child._id);
            }
        };

        await deleteChildren(folderId);

        // Delete files inside this folder and nested folders
        const File = require("../models/File");

        const foldersToDelete = await Folder.find({
            $or: [
                { _id: folderId },
                { parent: folderId },
            ],
        }).select("_id");

        const folderIds = foldersToDelete.map(
            (f) => f._id
        );

        folderIds.push(folderId);

        await File.deleteMany({
            folder: { $in: folderIds },
        });

        await Folder.findByIdAndDelete(folderId);

        res.status(200).json({
            success: true,
            message: "Folder deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};