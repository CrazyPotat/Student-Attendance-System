const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Student routes
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Student Attendance Monitoring System API is running!"
    });
});

// Test database
app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            message: "Database connection is working!",
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed.",
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});