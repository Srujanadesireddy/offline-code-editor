const {
    createProject,
    getProjects,
    deleteProject,
    shareProject,
    joinProject,
} = require("../controllers/projectController");

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware"); 

router.get("/", authMiddleware, getProjects);

router.post("/", authMiddleware, createProject);

router.post("/:id/share", authMiddleware, shareProject);

router.post("/join", authMiddleware, joinProject);

router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;