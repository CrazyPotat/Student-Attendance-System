const express = require("express");
const router = express.Router();

const db = require("../db");

// GET all students
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM students ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching students:", error);

        res.status(500).json({
            message: "Failed to fetch students.",
            error: error.message
        });
    }
});

// POST a new student
router.post("/", async (req, res) => {
    try {
        const {
            student_number,
            full_name,
            course,
            year_level
        } = req.body;

        if (!student_number || !full_name) {
            return res.status(400).json({
                message: "Student number and full name are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO students
            (student_number, full_name, course, year_level)
            VALUES (?, ?, ?, ?)`,
            [
                student_number,
                full_name,
                course || null,
                year_level || null
            ]
        );

        res.status(201).json({
            message: "Student added successfully!",
            student_id: result.insertId
        });
    } catch (error) {
        console.error("Error adding student:", error);

        res.status(500).json({
            message: "Failed to add student.",
            error: error.message
        });
    }
});

module.exports = router;