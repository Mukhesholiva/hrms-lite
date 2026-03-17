from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import List
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

    @field_validator('employee_id')
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Employee ID required')
        return v.strip()

class AttendanceResponse(AttendanceCreate):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class AttendanceList(BaseModel):
    attendance_records: List[AttendanceResponse]
    total: int

class AttendanceSummary(BaseModel):
    employee_id: str
    full_name: str
    total_present: int
    total_absent: int
