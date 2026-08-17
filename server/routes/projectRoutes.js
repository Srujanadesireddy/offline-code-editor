const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createProject,
    getProjects,
    deleteProject,
} = require("../controllers/projectController"); 

router.get("/", authMiddleware, getProjects);

router.post("/", authMiddleware, createProject);

router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;