from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

EmploymentType = Literal[
    "full-time",
    "part-time",
    "contract",
    "intern",
]

class EmployeeRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    job_title: str
    email: EmailStr
    phone_number: str | None
    employment_type: EmploymentType
    department: str
    hire_date: date
    status: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmployeeCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    job_title: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str | None = Field(default=None, max_length=30)
    employment_type: EmploymentType
    department: str = Field(min_length=1, max_length=100)
    hire_date: date
    status: bool = True

class EmployeeUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    job_title: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    phone_number: str | None = Field(default=None, max_length=30)
    employment_type: EmploymentType | None = None
    department: str | None = Field(default=None, min_length=1, max_length=100)
    hire_date: date | None = None
    status: bool | None = None
    