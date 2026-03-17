# HRMS Lite

A lightweight Human Resource Management System for managing employees and tracking daily attendance.

## Project Overview

HRMS Lite is a web-based application that allows administrators to:
- Manage employee records (Add, View, Delete)
- Track daily attendance (Mark Present/Absent)
- View attendance history with filters
- See dashboard with summary statistics

## Live Demo

- **Application URL:** http://43.204.231.57
- **API Endpoint:** http://43.204.231.57/api

## Tech Stack

### Frontend
- React 18
- React Router v6
- Axios (HTTP client)
- Vite (Build tool)

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy (ORM)
- Pydantic (Validation)

### Database
- PostgreSQL

### Deployment
- AWS EC2 (Ubuntu)
- Nginx (Reverse proxy)
- Systemd (Process manager)

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API endpoints
│   │   ├── schemas/       # Request/Response schemas
│   │   ├── config.py      # Configuration
│   │   ├── database.py    # DB connection
│   │   └── main.py        # App entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── services/      # API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Steps to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql://username:password@localhost:5432/hrms" > .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees/ | List all employees |
| POST | /api/employees/ | Create new employee |
| GET | /api/employees/{id} | Get employee by ID |
| DELETE | /api/employees/{id} | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/attendance/ | List attendance records |
| POST | /api/attendance/ | Mark attendance |
| GET | /api/attendance/employee/{id} | Get employee attendance |
| GET | /api/attendance/summary/{id} | Get attendance summary |

## Assumptions

- Single admin user (no authentication required)
- Employee ID is a unique string (alphanumeric)
- Attendance can be updated by re-submitting for the same employee and date
- One attendance record per employee per day

## Limitations

- No user authentication/authorization
- No employee update functionality (only add/delete)
- No pagination for large datasets
- No export functionality (CSV/PDF)

## Author

Mukhesh Oliva
