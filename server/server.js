require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT;

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend Connected Successfully!"
    });
});



connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});