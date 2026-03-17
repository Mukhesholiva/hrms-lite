import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, deleteEmployee } from '../services/api'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' })

  const load = async () => {
    try {
      const res = await getEmployees()
      setEmployees(res.data.employees)
    } catch (e) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.employee_id || !form.full_name || !form.email || !form.department) {
      setError('All fields required')
      return
    }
    try {
      await createEmployee(form)
      setSuccess('Employee added')
      setShowModal(false)
      setForm({ employee_id: '', full_name: '', email: '', department: '' })
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    try {
      await deleteEmployee(id)
      setSuccess('Deleted')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Failed to delete')
    }
  }

  const depts = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Employees</h1>
          <p>Manage your team</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Employee</button>
      </div>

      {success && <div className="success-msg">{success}</div>}
      {error && !showModal && <div className="error-msg">{error}</div>}

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : employees.length === 0 ? (
          <div className="empty-state">No employees yet</div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Action</th></tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.employee_id}>
                  <td><strong>{e.employee_id}</strong></td>
                  <td>{e.full_name}</td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td><button className="btn btn-danger" onClick={() => handleDelete(e.employee_id)}>Delete</button></td>
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
              <h3>Add Employee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee ID</label>
                <input value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} placeholder="EMP001" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="">Select</option>
                  {depts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
