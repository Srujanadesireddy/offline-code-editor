const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createFolder,
    getFolders,
    renameFolder,
    deleteFolder,
} = require("../controllers/folderController");

router.post("/", authMiddleware, createFolder);

router.get("/:projectId", authMiddleware, getFolders);

router.put("/:id/rename", authMiddleware, renameFolder);

router.delete("/:id", authMiddleware, deleteFolder);

module.exports = router;