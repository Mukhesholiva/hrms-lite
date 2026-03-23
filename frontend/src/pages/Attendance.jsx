import { useState, useEffect } from 'react'
import { getEmployees, getAttendance, markAttendance, getAttendanceSummary } from '../services/api'

function Attendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterEmp, setFilterEmp] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [summary, setSummary] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  })

  const loadRecords = async () => {
    const params = {}
    if (filterEmp) params.employee_id = filterEmp
    if (filterDate) { params.start_date = filterDate; params.end_date = filterDate }
    const res = await getAttendance(params)
    setRecords(res.data.attendance_records)
    setCurrentPage(1)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getEmployees()
        setEmployees(res.data.employees)
        await loadRecords()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => { loadRecords() }, [filterEmp, filterDate])

  const loadSummary = async (id) => {
    if (!id) { setSummary(null); return }
    const res = await getAttendanceSummary(id)
    setSummary(res.data)
  }

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.employee_id || !form.date) {
      setError('Please select an employee and date')
      return
    }
    if (form.date > today) {
      setError('Cannot mark attendance for future dates')
      return
    }
    try {
      await markAttendance(form)
      setSuccess('Attendance marked successfully')
      setShowModal(false)
      setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' })
      loadRecords()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to mark attendance')
    }
  }

  const getName = (id) => employees.find(e => e.employee_id === id)?.full_name || id
  const getDept = (id) => employees.find(e => e.employee_id === id)?.department || ''

  const deptColors = {
    'Engineering': '#3b82f6',
    'Marketing': '#8b5cf6',
    'HR': '#10b981',
    'Finance': '#f59e0b',
    'Sales': '#ec4899',
    'Operations': '#06b6d4'
  }

  // Pagination
  const totalPages = Math.ceil(records.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track daily attendance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Mark Attendance
        </button>
      </div>

      {success && <div className="success-msg">{success}</div>}
      {error && !showModal && <div className="error-msg">{error}</div>}

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Filter Records</h3>
        <div className="filters">
          <div className="form-group">
            <label>Employee</label>
            <select value={filterEmp} onChange={e => { setFilterEmp(e.target.value); loadSummary(e.target.value) }}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={() => { setFilterEmp(''); setFilterDate(''); setSummary(null) }}>
            Clear Filters
          </button>
        </div>
        {summary && (
          <div className="summary-box">
            <div className="summary-content">
              <div className="summary-user">
                <div className="avatar">{summary.full_name.charAt(0)}</div>
                <div>
                  <strong>{summary.full_name}</strong>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', display: 'block' }}>Attendance Summary</span>
                </div>
              </div>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-num green">{summary.total_present}</span>
                  <span className="stat-label">Present</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-num amber">{summary.total_absent}</span>
                  <span className="stat-label">Absent</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-num blue">
                    {summary.total_present + summary.total_absent > 0
                      ? Math.round((summary.total_present / (summary.total_present + summary.total_absent)) * 100)
                      : 0}%
                  </span>
                  <span className="stat-label">Rate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h3>Attendance Records ({records.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <p>No attendance records found</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Mark Attendance</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map(r => (
                  <tr key={r.id}>
                    <td className="date-cell">
                      {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar" style={{ background: deptColors[getDept(r.employee_id)] || '#64748b' }}>
                          {getName(r.employee_id).charAt(0)}
                        </div>
                        <div className="employee-info">
                          <span className="emp-name">{getName(r.employee_id)}</span>
                          <span className="emp-id">{r.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-badge" style={{ background: `${deptColors[getDept(r.employee_id)]}15`, color: deptColors[getDept(r.employee_id)] }}>
                        {getDept(r.employee_id)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {records.length > itemsPerPage && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, records.length)} of {records.length} records
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mark Attendance</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee</label>
                <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  max={today}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="status-options">
                  <label className={`status-option ${form.status === 'Present' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="Present"
                      checked={form.status === 'Present'}
                      onChange={e => setForm({...form, status: e.target.value})}
                    />
                    <span className="status-dot green"></span>
                    Present
                  </label>
                  <label className={`status-option ${form.status === 'Absent' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="Absent"
                      checked={form.status === 'Absent'}
                      onChange={e => setForm({...form, status: e.target.value})}
                    />
                    <span className="status-dot amber"></span>
                    Absent
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance
