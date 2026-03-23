import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, deleteEmployee } from '../services/api'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const deptColors = {
    'Engineering': '#3b82f6',
    'Marketing': '#8b5cf6',
    'HR': '#10b981',
    'Finance': '#f59e0b',
    'Sales': '#ec4899',
    'Operations': '#06b6d4'
  }

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
      setError('All fields are required')
      return
    }
    try {
      await createEmployee(form)
      setSuccess('Employee added successfully')
      setShowModal(false)
      setForm({ employee_id: '', full_name: '', email: '', department: '' })
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add employee')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return
    try {
      await deleteEmployee(id)
      setSuccess('Employee removed successfully')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Failed to delete')
    }
  }

  const depts = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']

  // Pagination
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = employees.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage your team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Employee
        </button>
      </div>

      {success && <div className="success-msg">{success}</div>}
      {error && !showModal && <div className="error-msg">{error}</div>}

      <div className="card table-card">
        <div className="card-header">
          <h3>All Employees ({employees.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <p>No employees added yet</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add First Employee</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map(emp => (
                  <tr key={emp.employee_id}>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar" style={{ background: deptColors[emp.department] || '#64748b' }}>
                          {emp.full_name.charAt(0)}
                        </div>
                        <div className="employee-info">
                          <span className="emp-name">{emp.full_name}</span>
                          <span className="emp-id">{emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">{emp.email}</td>
                    <td>
                      <span className="dept-badge" style={{ background: `${deptColors[emp.department]}15`, color: deptColors[emp.department] }}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(emp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(emp.employee_id, emp.full_name)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {employees.length > itemsPerPage && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, employees.length)} of {employees.length} employees
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
              <h3>Add New Employee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  value={form.employee_id}
                  onChange={e => setForm({...form, employee_id: e.target.value})}
                  placeholder="e.g. EMP001"
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="e.g. rahul@company.com"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="">Select Department</option>
                  {depts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
