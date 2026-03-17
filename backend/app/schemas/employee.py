from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import List

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator('employee_id', 'full_name', 'department')
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class EmployeeResponse(EmployeeCreate):
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class EmployeeList(BaseModel):
    employees: List[EmployeeResponse]
    total: int
