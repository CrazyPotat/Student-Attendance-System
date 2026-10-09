const express = require("express");
const router = express.Router();

const db = require("../db");

// =====================================================
// GET ALL ATTENDANCE RECORDS
// =====================================================
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                attendance.id,
                students.student_number,
                students.full_name,
                students.course,
                students.year_level,
                attendance.attendance_date,
                attendance.status,
                attendance.time_in,
                attendance.created_at
            FROM attendance
            INNER JOIN students
                ON attendance.student_id = students.id
            ORDER BY attendance.attendance_date DESC, attendance.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching attendance:", error);

        res.status(500).json({
            message: "Failed to fetch attendance records.",
            error: error.message
        });
    }
});


// =====================================================
// POST ATTENDANCE RECORD
// =====================================================
router.post("/", async (req, res) => {
    try {

        const {
            student_id,
            attendance_date,
            status,
            time_in
        } = req.body;


        // -------------------------------------------------
        // 1. CHECK REQUIRED FIELDS
        // -------------------------------------------------
        if (!student_id || !attendance_date || !status) {
            return res.status(400).json({
                message:
                    "Student ID, attendance date, and status are required."
            });
        }


        // -------------------------------------------------
        // 2. CHECK VALID STATUS
        // -------------------------------------------------
        const validStatuses = [
            "Present",
            "Absent",
            "Late"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Status must be Present, Absent, or Late."
            });
        }


        // -------------------------------------------------
        // 3. CHECK STUDENT EXISTS
        // -------------------------------------------------
        const [students] = await db.query(
            `
            SELECT
                id,
                student_number,
                full_name
            FROM students
            WHERE id = ?
            `,
            [student_id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const student = students[0];


        // -------------------------------------------------
        // 4. CHECK DUPLICATE ATTENDANCE
        // -------------------------------------------------
        const [existingAttendance] = await db.query(
            `
            SELECT
                id,
                status,
                time_in
            FROM attendance
            WHERE student_id = ?
            AND attendance_date = ?
            `,
            [
                student_id,
                attendance_date
            ]
        );

        if (existingAttendance.length > 0) {

            const existing = existingAttendance[0];

            return res.status(409).json({
                message:
                    "Attendance for this student has already been recorded for this date.",
                attendance_id: existing.id,
                existing_status: existing.status,
                existing_time_in: existing.time_in
            });
        }


        // -------------------------------------------------
        // 5. INSERT ATTENDANCE
        // -------------------------------------------------
        const [result] = await db.query(
            `
            INSERT INTO attendance
            (
                student_id,
                attendance_date,
                status,
                time_in
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                student_id,
                attendance_date,
                status,
                time_in || null
            ]
        );


        // -------------------------------------------------
        // 6. SUCCESS RESPONSE
        // -------------------------------------------------
        res.status(201).json({
            message:
                "Attendance recorded successfully!",
            attendance_id:
                result.insertId,
            student: {
                id: student.id,
                student_number:
                    student.student_number,
                full_name:
                    student.full_name
            },
            attendance: {
                date: attendance_date,
                status: status,
                time_in: time_in || null
            }
        });

    } catch (error) {

    console.error(
        "Error recording attendance:",
        error
    );

    // Duplicate attendance
    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message:
                "Attendance for this student has already been recorded for this date.",
            error: "Duplicate attendance record."
        });
    }

    // Other server errors
    res.status(500).json({
        message:
            "Failed to record attendance.",
        error: error.message
    });
}
});


// =====================================================
// GET ATTENDANCE SUMMARY
// =====================================================
router.get("/summary", async (req, res) => {
    try {

        // Total students
        const [totalStudents] =
            await db.query(
                `
                SELECT COUNT(*) AS total_students
                FROM students
                `
            );


        // Present today
        const [present] =
            await db.query(
                `
                SELECT COUNT(*) AS count
                FROM attendance
                WHERE attendance_date = CURDATE()
                AND status = 'Present'
                `
            );


        // Absent today
        const [absent] =
            await db.query(
                `
                SELECT COUNT(*) AS count
                FROM attendance
                WHERE attendance_date = CURDATE()
                AND status = 'Absent'
                `
            );


        // Late today
        const [late] =
            await db.query(
                `
                SELECT COUNT(*) AS count
                FROM attendance
                WHERE attendance_date = CURDATE()
                AND status = 'Late'
                `
            );


        res.json({
            total_students:
                totalStudents[0].total_students,

            present:
                present[0].count,

            absent:
                absent[0].count,

            late:
                late[0].count
        });

    } catch (error) {

        console.error(
            "Error fetching attendance summary:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch attendance summary.",
            error: error.message
        });
    }
});


module.exports = router;