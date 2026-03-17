from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import uuid
from app.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance, AttendanceStatus as DBStatus
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceList, AttendanceSummary

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    if not db.query(Employee).filter(Employee.employee_id == data.employee_id).first():
        raise HTTPException(status_code=404, detail=f"Employee '{data.employee_id}' not found")

    existing = db.query(Attendance).filter(
        Attendance.employee_id == data.employee_id,
        Attendance.date == data.date
    ).first()

    if existing:
        existing.status = DBStatus(data.status.value)
        db.commit()
        db.refresh(existing)
        return existing

    record = Attendance(
        id=str(uuid.uuid4()),
        employee_id=data.employee_id,
        date=data.date,
        status=DBStatus(data.status.value)
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/", response_model=AttendanceList)
def get_attendance(
    employee_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Attendance)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return AttendanceList(attendance_records=records, total=len(records))

@router.get("/employee/{employee_id}", response_model=AttendanceList)
def get_employee_attendance(employee_id: str, db: Session = Depends(get_db)):
    if not db.query(Employee).filter(Employee.employee_id == employee_id).first():
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

    records = db.query(Attendance).filter(Attendance.employee_id == employee_id).order_by(Attendance.date.desc()).all()
    return AttendanceList(attendance_records=records, total=len(records))

@router.get("/summary/{employee_id}", response_model=AttendanceSummary)
def get_summary(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

    present = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id, Attendance.status == DBStatus.PRESENT
    ).scalar() or 0

    absent = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id, Attendance.status == DBStatus.ABSENT
    ).scalar() or 0

    return AttendanceSummary(
        employee_id=employee_id,
        full_name=employee.full_name,
        total_present=present,
        total_absent=absent
    )
