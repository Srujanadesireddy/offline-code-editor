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
} = require("../controllers/fileController");

router.post("/", authMiddleware, createFile);

router.get("/single/:id", authMiddleware, getFile);

router.get("/:projectId", authMiddleware, getFiles);

router.put("/:id/rename", authMiddleware, renameFile);

router.put("/:id", authMiddleware, updateFile);

router.delete("/:id", authMiddleware, deleteFile);

module.exports = router;