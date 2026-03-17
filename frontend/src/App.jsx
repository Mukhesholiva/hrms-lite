import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="logo"><h2>HRMS Lite</h2></div>
          <ul className="nav-links">
            <li><NavLink to="/" end>Dashboard</NavLink></li>
            <li><NavLink to="/employees">Employees</NavLink></li>
            <li><NavLink to="/attendance">Attendance</NavLink></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
