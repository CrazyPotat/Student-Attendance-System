const express = require('express')
const bcrypt = require('bcrypt')
const db = require('../db')

const router = express.Router()

// ADMIN REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      password
    } = req.body

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email, and password are required.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      })
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Email is already registered.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      `INSERT INTO users
       (full_name, email, password, role)
       VALUES (?, ?, ?, 'admin')`,
      [
        full_name,
        email,
        hashedPassword
      ]
    )

    res.status(201).json({
      message: 'Admin account created successfully!',
      admin_id: result.insertId
    })

  } catch (error) {
    console.error('Register error:', error)

    res.status(500).json({
      message: 'Server error while creating admin account.'
    })
  }
})

// ADMIN LOGIN
router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      })
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      })
    }

    const user = users[0]

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      })
    }

    res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      message: 'Server error during login.'
    })
  }
})

module.exports = router