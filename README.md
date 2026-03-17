# HRMS Lite

A lightweight Human Resource Management System.

## Tech Stack

- **Frontend:** React, Vite, Axios
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL

## Features

- Employee Management (Add, View, Delete)
- Attendance Tracking (Mark Present/Absent)
- Filter attendance by employee and date
- Dashboard with summary stats

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create .env with DATABASE_URL
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/employees/` - List employees
- `POST /api/employees/` - Add employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/attendance/` - List attendance
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/summary/{id}` - Get summary

## Live

- App: http://43.204.231.57
