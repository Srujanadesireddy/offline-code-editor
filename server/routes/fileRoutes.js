const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createFile,
    getFiles,
    getFile,
    updateFile,
    renameFile,
    deleteFile,
    moveFile,
    getFileVersions,
    deleteFileVersion,
} = require("../controllers/fileController");

router.post("/", authMiddleware, createFile);

router.get("/single/:id", authMiddleware, getFile);

router.get("/:projectId", authMiddleware, getFiles);

router.put("/:id/rename", authMiddleware, renameFile);

router.put("/:id/move", authMiddleware, moveFile);

router.get("/:id/versions", authMiddleware, getFileVersions);

router.delete(
  "/:id/versions/:versionId",
  authMiddleware,
  deleteFileVersion
);

router.put("/:id", authMiddleware, updateFile);

router.delete("/:id", authMiddleware, deleteFile);

module.exports = router;