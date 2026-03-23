import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, getAttendance } from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 })
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState({})
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const [empRes, attRes] = await Promise.all([
          getEmployees(),
          getAttendance({ start_date: today, end_date: today })
        ])
        const emps = empRes.data.employees
        const att = attRes.data.attendance_records

        // Calculate department distribution
        const deptCount = {}
        emps.forEach(emp => {
          deptCount[emp.department] = (deptCount[emp.department] || 0) + 1
        })
        setDepartments(deptCount)

        setStats({
          total: emps.length,
          present: att.filter(a => a.status === 'Present').length,
          absent: att.filter(a => a.status === 'Absent').length
        })
        setEmployees(emps)
        setRecentAttendance(att.slice(0, 6))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.employee_id === empId)
    return emp ? emp.full_name : empId
  }

  const deptColors = {
    'Engineering': '#3b82f6',
    'Marketing': '#8b5cf6',
    'HR': '#10b981',
    'Finance': '#f59e0b',
    'Sales': '#ec4899',
    'Operations': '#06b6d4'
  }

  const totalDept = Object.values(departments).reduce((a, b) => a + b, 0)
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / (stats.present + stats.absent)) * 100) || 0 : 0

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{today}</p>
        </div>
        <Link to="/attendance" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Mark Attendance
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Employees</h3>
            <div className="value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Present Today</h3>
            <div className="value">{stats.present}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Absent Today</h3>
            <div className="value">{stats.absent}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Attendance Chart */}
        <div className="card chart-card">
          <h3>Today's Attendance</h3>
          <div className="donut-chart">
            <svg viewBox="0 0 36 36" className="donut">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${attendanceRate} ${100 - attendanceRate}`}
                strokeDashoffset="25"
                strokeLinecap="round"
              />
            </svg>
            <div className="donut-center">
              <span className="donut-value">{attendanceRate}%</span>
              <span className="donut-label">Present</span>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot green"></span>
              <span>Present ({stats.present})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot amber"></span>
              <span>Absent ({stats.absent})</span>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card chart-card">
          <h3>Department Distribution</h3>
          <div className="bar-chart">
            {Object.entries(departments).map(([dept, count]) => (
              <div className="bar-item" key={dept}>
                <div className="bar-label">
                  <span>{dept}</span>
                  <span className="bar-count">{count}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / totalDept) * 100}%`,
                      background: deptColors[dept] || '#64748b'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="tables-row">
        {/* Recent Employees */}
        <div className="card table-card">
          <div className="card-header">
            <h3>Employees</h3>
            <Link to="/employees" className="view-all">View All →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map(emp => (
                  <tr key={emp.employee_id}>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar">{emp.full_name.charAt(0)}</div>
                        <div className="employee-info">
                          <span className="emp-name">{emp.full_name}</span>
                          <span className="emp-id">{emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-badge" style={{ background: `${deptColors[emp.department]}15`, color: deptColors[emp.department] }}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="email-cell">{emp.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="card table-card">
          <div className="card-header">
            <h3>Today's Attendance</h3>
            <Link to="/attendance" className="view-all">View All →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="empty-cell">No attendance marked today</td>
                  </tr>
                ) : (
                  recentAttendance.map(att => (
                    <tr key={att.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">{getEmployeeName(att.employee_id).charAt(0)}</div>
                          <div className="employee-info">
                            <span className="emp-name">{getEmployeeName(att.employee_id)}</span>
                            <span className="emp-id">{att.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${att.status.toLowerCase()}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
