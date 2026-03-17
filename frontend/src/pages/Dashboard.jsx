import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, getAttendance } from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 })
  const [employees, setEmployees] = useState([])
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
        setStats({
          total: emps.length,
          present: att.filter(a => a.status === 'Present').length,
          absent: att.filter(a => a.status === 'Absent').length
        })
        setEmployees(emps.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your HR system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <div className="value">{stats.present}</div>
        </div>
        <div className="stat-card">
          <h3>Absent Today</h3>
          <div className="value">{stats.absent}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3>Recent Employees</h3>
          <Link to="/employees" className="btn btn-secondary">View All</Link>
        </div>
        {employees.length === 0 ? (
          <div className="empty-state">No employees yet</div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Department</th><th>Email</th></tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.employee_id}>
                  <td><strong>{e.employee_id}</strong></td>
                  <td>{e.full_name}</td>
                  <td>{e.department}</td>
                  <td>{e.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
