const File = require("../models/File");
const FileVersion = require("../models/FileVersion");

exports.createFile = async (req, res) => {
  try {

    const { name, language, projectId, folderId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const file = await File.create({
      name,
      language,
      project: projectId,
      folder: folderId || null,
      content: "",
    });

    res.status(201).json({
      success: true,
      message: "File created successfully",
      file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getFiles = async (req, res) => {
  try {

    const { projectId } = req.params;

    const files = await File.find({
      project: projectId,
    });

    res.status(200).json({
      success: true,
      files,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getFile = async (req, res) => {
  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.updateFile = async (req, res) => {
  try {

    console.log("🔥 updateFile CALLED:", req.params.id);

    const { content } = req.body;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const lastVersion = await FileVersion.findOne({
      file: file._id,
    }).sort({ versionNumber: -1 });

    const nextVersion = lastVersion
      ? lastVersion.versionNumber + 1
      : 1;

    await FileVersion.create({
      file: file._id,
      content: file.content,
      versionNumber: nextVersion,
      createdBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      file,
    });

  } catch (error) {
    console.error("Update file error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.renameFile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const file = await File.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File renamed successfully",
      file,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      {
        folder: folderId || null,
      },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File moved successfully",
      file,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getFileVersions = async (req, res) => {
  try {
    const versions = await FileVersion.find({
      file: req.params.id,
    })
      .sort({ versionNumber: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      versions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFileVersion = async (req, res) => {
  try {
    const version = await FileVersion.findByIdAndDelete(
      req.params.versionId
    );

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Version not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Version deleted successfully",
    });
  } catch (error) {
    console.error("Delete version error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};