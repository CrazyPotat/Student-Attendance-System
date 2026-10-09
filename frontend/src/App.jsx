import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://student-attendance-backend-dusky.vercel.app/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('adminLoggedIn') === 'true'
  )

  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('adminUser')

    return savedAdmin
      ? JSON.parse(savedAdmin)
      : null
  })

  const handleLogin = (user) => {
    localStorage.setItem('adminLoggedIn', 'true')
    localStorage.setItem(
      'adminUser',
      JSON.stringify(user)
    )

    setAdmin(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminUser')

    setAdmin(null)
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Dashboard
      admin={admin}
      onLogout={handleLogout}
    />
  )
}

/* =========================
   LOGIN
========================= */
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      onLogin(data.user)
    } catch (error) {
      setError(error.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

return (
  <div className="login-page">

    <div className="login-container">

      {/* LEFT BRANDING PANEL */}
      <div className="login-brand-panel">

        <div className="brand-icon">
          ✓
        </div>

        <h1>
          Attendance
          <br />
          Management
        </h1>

        <p>
          A simple and efficient way to manage
          student attendance records.
        </p>

        <div className="brand-line"></div>

        <span>
          Student Attendance Monitoring System
        </span>

      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="login-form-panel">

        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your administrator account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          <div className="login-field">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <p className="login-footer">
          Administrator access only
        </p>

      </div>

    </div>

  </div>
)

}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  admin,
  onLogout,
}) {
  const [activePage, setActivePage] =
    useState('Dashboard')

  const menuItems = [
    'Dashboard',
    'Students',
    'Add Student',
    'Record Attendance',
    'Attendance Records',
  ]

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            ✓
          </div>

          <div>
            <h2>
              Attendance
            </h2>

            <span>
              Management System
            </span>
          </div>

        </div>

        <nav>

          {menuItems.map((item) => (

            <button
              key={item}
              className={
                activePage === item
                  ? 'menu-item active'
                  : 'menu-item'
              }
              onClick={() =>
                setActivePage(item)
              }
            >

              <span className="menu-icon">

                {item === 'Dashboard' && '⌂'}
                {item === 'Students' && '♙'}
                {item === 'Add Student' && '+'}
                {item === 'Record Attendance' && '✓'}
                {item === 'Attendance Records' && '▤'}

              </span>

              {item}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="user-box">

            <div className="avatar">
              {admin?.full_name
                ? admin.full_name.charAt(0)
                : 'A'}
            </div>

            <div>

              <strong>
                {admin?.full_name ||
                  'Administrator'}
              </strong>

              <span>
                {admin?.email ||
                  'School Admin'}
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>

            <h1>
              {activePage}
            </h1>

            <p>
              {activePage === 'Dashboard'
                ? 'Welcome back! Here is your attendance overview.'
                : `Manage your ${activePage.toLowerCase()} here.`}
            </p>

          </div>

          <div className="date-box">

            <span>
              Today
            </span>

            <strong>
              {new Date().toLocaleDateString()}
            </strong>

          </div>

        </header>

        {activePage === 'Dashboard' && (
          <DashboardPage />
        )}

        {activePage === 'Students' && (
          <Students />
        )}

        {activePage === 'Add Student' && (
          <AddStudent
            onSuccess={() =>
              setActivePage('Students')
            }
          />
        )}

        {activePage === 'Record Attendance' && (
          <RecordAttendance />
        )}

        {activePage === 'Attendance Records' && (
          <AttendanceRecords />
        )}

      </main>

    </div>
  )
}

/* =========================
   DASHBOARD PAGE
========================= */

function DashboardPage() {
  const [students, setStudents] = useState([])

  const [summary, setSummary] =
    useState({
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
    })

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const studentsResponse =
        await fetch(
          `${API_URL}/students`
        )

      const studentsData =
        await studentsResponse.json()

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      )

      const summaryResponse =
        await fetch(
          `${API_URL}/attendance/summary`
        )

      const summaryData =
        await summaryResponse.json()

      setSummary({
        total:
          Number(
            summaryData.total_students
          ) ||
          studentsData.length ||
          0,

        present:
          Number(
            summaryData.present
          ) || 0,

        absent:
          Number(
            summaryData.absent
          ) || 0,

        late:
          Number(
            summaryData.late
          ) || 0,
      })

    } catch (error) {
      console.error(
        'Dashboard error:',
        error
      )
    }
  }

  return (
    <>

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon students-icon">
            ♙
          </div>

          <div>
            <span>
              Total Students
            </span>

            <h2>
              {summary.total}
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon present-icon">
            ✓
          </div>

          <div>
            <span>
              Present
            </span>

            <h2>
              {summary.present}
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon absent-icon">
            ×
          </div>

          <div>
            <span>
              Absent
            </span>

            <h2>
              {summary.absent}
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon late-icon">
            ◷
          </div>

          <div>
            <span>
              Late
            </span>

            <h2>
              {summary.late}
            </h2>
          </div>

        </div>

      </section>

      <section className="content-card">

        <div className="card-header">

          <div>

            <h2>
              Registered Students
            </h2>

            <p>
              Students currently registered in the system.
            </p>

          </div>

        </div>

        {students.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              👨‍🎓
            </div>

            <h3>
              No students yet
            </h3>

            <p>
              Add a student to start using the attendance system.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Student Number</th>
                  <th>Full Name</th>
                  <th>Course</th>
                  <th>Year Level</th>
                </tr>

              </thead>

              <tbody>

                {students.map(
                  (student) => (

                    <tr key={student.id}>

                      <td>
                        {student.student_number}
                      </td>

                      <td>
                        {student.full_name}
                      </td>

                      <td>
                        {student.course}
                      </td>

                      <td>
                        {student.year_level}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </>
  )
}

/* =========================
   STUDENTS
========================= */

function Students() {
  const [students, setStudents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    fetch(`${API_URL}/students`)
      .then(
        (response) =>
          response.json()
      )
      .then((data) => {

        setStudents(
          Array.isArray(data)
            ? data
            : []
        )

      })
      .catch((error) => {

        console.error(
          'Students error:',
          error
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [])

  return (
    <section className="content-card">

      <div className="card-header">

        <div>

          <h2>
            Students
          </h2>

          <p>
            List of registered students.
          </p>

        </div>

      </div>

      {loading ? (

        <div className="loading">
          Loading students...
        </div>

      ) : students.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            👨‍🎓
          </div>

          <h3>
            No students registered
          </h3>

          <p>
            Add your first student using the Add Student menu.
          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Student Number</th>
                <th>Full Name</th>
                <th>Course</th>
                <th>Year Level</th>
              </tr>

            </thead>

            <tbody>

              {students.map(
                (student) => (

                  <tr key={student.id}>

                    <td>
                      {student.student_number}
                    </td>

                    <td>
                      {student.full_name}
                    </td>

                    <td>
                      {student.course}
                    </td>

                    <td>
                      {student.year_level}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>
  )
}

/* =========================
   ADD STUDENT
========================= */

function AddStudent({
  onSuccess,
}) {
  const [form, setForm] =
    useState({
      student_number: '',
      full_name: '',
      course: '',
      year_level: '',
    })

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault()

    setMessage('')
    setError('')
    setSaving(true)

    try {

      const response =
        await fetch(
          `${API_URL}/students`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              student_number:
                form.student_number,

              full_name:
                form.full_name,

              course:
                form.course,

              year_level:
                Number(
                  form.year_level
                ),
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to add student.'
        )
      }

      setMessage(
        'Student added successfully!'
      )

      setForm({
        student_number: '',
        full_name: '',
        course: '',
        year_level: '',
      })

      setTimeout(() => {

        if (onSuccess) {
          onSuccess()
        }

      }, 800)

    } catch (error) {

      setError(
        error.message
      )

    } finally {

      setSaving(false)

    }
  }

  return (
    <section className="form-card">

      <div className="card-header">

        <div>

          <h2>
            Add New Student
          </h2>

          <p>
            Enter the student's information below.
          </p>

        </div>

      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        className="student-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Student Number
          </label>

          <input
            type="text"
            name="student_number"
            value={
              form.student_number
            }
            onChange={(event) =>
              setForm({
                ...form,
                student_number:
                  event.target.value,
              })
            }
            placeholder="e.g. 2026-0003"
            required
          />

        </div>

        <div className="form-group">

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="full_name"
            value={
              form.full_name
            }
            onChange={(event) =>
              setForm({
                ...form,
                full_name:
                  event.target.value,
              })
            }
            placeholder="Enter full name"
            required
          />

        </div>

        <div className="form-group">

          <label>
            Course
          </label>

          <input
            type="text"
            name="course"
            value={
              form.course
            }
            onChange={(event) =>
              setForm({
                ...form,
                course:
                  event.target.value,
              })
            }
            placeholder="e.g. BS Information Technology"
            required
          />

        </div>

        <div className="form-group">

          <label>
            Year Level
          </label>

          <select
            name="year_level"
            value={
              form.year_level
            }
            onChange={(event) =>
              setForm({
                ...form,
                year_level:
                  event.target.value,
              })
            }
            required
          >

            <option value="">
              Select year level
            </option>

            <option value="1">
              1
            </option>

            <option value="2">
              2
            </option>

            <option value="3">
              3
            </option>

            <option value="4">
              4
            </option>

          </select>

        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? 'Saving...'
            : 'Add Student'}
        </button>

      </form>

    </section>
  )
}

/* =========================
   RECORD ATTENDANCE
========================= */

function RecordAttendance() {
  const [students, setStudents] =
    useState([])

  const [form, setForm] =
    useState({
      student_id: '',
      status: 'Present',
    })

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {

    fetch(`${API_URL}/students`)
      .then(
        (response) =>
          response.json()
      )
      .then((data) => {

        setStudents(
          Array.isArray(data)
            ? data
            : []
        )

      })
      .catch((error) => {

        console.error(
          'Students error:',
          error
        )

      })

  }, [])

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault()

    setMessage('')
    setError('')
    setSaving(true)

    try {

      const response =
        await fetch(
          `${API_URL}/attendance`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              student_id:
                Number(
                  form.student_id
                ),

              status:
                form.status,
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to record attendance.'
        )
      }

      setMessage(
        data.message ||
          'Attendance recorded successfully!'
      )

      setForm({
        student_id: '',
        status: 'Present',
      })

    } catch (error) {

      setError(
        error.message
      )

    } finally {

      setSaving(false)

    }
  }

  return (
    <section className="form-card">

      <div className="card-header">

        <div>

          <h2>
            Record Attendance
          </h2>

          <p>
            Record student attendance.
          </p>

        </div>

      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        className="student-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Student
          </label>

          <select
            value={
              form.student_id
            }
            onChange={(event) =>
              setForm({
                ...form,
                student_id:
                  event.target.value,
              })
            }
            required
          >

            <option value="">
              Select student
            </option>

            {students.map(
              (student) => (

                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.student_number}
                  {' - '}
                  {student.full_name}
                </option>

              )
            )}

          </select>

        </div>

        <div className="form-group">

          <label>
            Status
          </label>

          <select
            value={form.status}
            onChange={(event) =>
              setForm({
                ...form,
                status:
                  event.target.value,
              })
            }
          >

            <option value="Present">
              Present
            </option>

            <option value="Absent">
              Absent
            </option>

            <option value="Late">
              Late
            </option>

          </select>

        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? 'Saving...'
            : 'Record Attendance'}
        </button>

      </form>

    </section>
  )
}

/* =========================
   ATTENDANCE RECORDS
========================= */

function AttendanceRecords() {
  const [records, setRecords] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    fetch(`${API_URL}/attendance`)
      .then(
        (response) =>
          response.json()
      )
      .then((data) => {

        setRecords(
          Array.isArray(data)
            ? data
            : []
        )

      })
      .catch((error) => {

        console.error(
          'Attendance error:',
          error
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [])

  return (
    <section className="content-card">

      <div className="card-header">

        <div>

          <h2>
            Attendance Records
          </h2>

          <p>
            View all recorded attendance.
          </p>

        </div>

      </div>

      {loading ? (

        <div className="loading">
          Loading attendance records...
        </div>

      ) : records.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            📋
          </div>

          <h3>
            No attendance records yet
          </h3>

          <p>
            Record attendance to see the records here.
          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Student</th>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
              </tr>

            </thead>

            <tbody>

              {records.map(
                (record) => (

                  <tr key={record.id}>

                    <td>
                      {record.full_name ||
                        record.student_name ||
                        record.student_id}
                    </td>

                    <td>
                      {record.attendance_date
                        ? new Date(
                            record.attendance_date
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    <td>

                      <span
                        className={`status ${String(
                          record.status || ''
                        ).toLowerCase()}`}
                      >
                        {record.status}
                      </span>

                    </td>

                    <td>
                      {record.time_in || '-'}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>
  )
}

export default App