const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createProject,
} = require("../controllers/projectController");

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Project route working",
    });
});

router.post("/", authMiddleware, createProject);

module.exports = router;