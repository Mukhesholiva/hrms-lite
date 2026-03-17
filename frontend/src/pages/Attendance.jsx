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
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' })

  const loadRecords = async () => {
    const params = {}
    if (filterEmp) params.employee_id = filterEmp
    if (filterDate) { params.start_date = filterDate; params.end_date = filterDate }
    const res = await getAttendance(params)
    setRecords(res.data.attendance_records)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.employee_id || !form.date) { setError('All fields required'); return }
    try {
      await markAttendance(form)
      setSuccess('Attendance marked')
      setShowModal(false)
      setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' })
      loadRecords()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed')
    }
  }

  const getName = (id) => employees.find(e => e.employee_id === id)?.full_name || id

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Attendance</h1>
          <p>Track daily attendance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Mark Attendance</button>
      </div>

      {success && <div className="success-msg">{success}</div>}
      {error && !showModal && <div className="error-msg">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Filters</h3>
        <div className="filters">
          <div className="form-group">
            <label>Employee</label>
            <select value={filterEmp} onChange={e => { setFilterEmp(e.target.value); loadSummary(e.target.value) }}>
              <option value="">All</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={() => { setFilterEmp(''); setFilterDate(''); setSummary(null) }}>Clear</button>
        </div>
        {summary && (
          <div className="summary-box">
            <strong>{summary.full_name}</strong> — Present: {summary.total_present} | Absent: {summary.total_absent}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Records ({records.length})</h3>
        {loading ? <div className="loading">Loading...</div> : records.length === 0 ? (
          <div className="empty-state">No records</div>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Employee ID</th><th>Name</th><th>Status</th></tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td><strong>{r.employee_id}</strong></td>
                  <td>{getName(r.employee_id)}</td>
                  <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <option value="">Select</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
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
