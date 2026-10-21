from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeRead, EmployeeCreate, EmployeeUpdate
from app.dependencies import get_current_user, require_admin

router = APIRouter(
    prefix="/employees", 
    tags=["Employees"]
)

def get_employee(employee_id, db):
    employee = db.get(Employee, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )
    
    return employee

@router.get("/", response_model=list[EmployeeRead])
def show_employees(search: str | None = None, department: str | None = None, status: bool | None = None,  db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    statement = select(Employee)

    if search:
        search_term = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.email.ilike(search_term),
                Employee.job_title.ilike(search_term),
            )
        )

    if department is not None:
        statement = statement.where(Employee.department == department)

    if status is not None:
        statement = statement.where(Employee.status == status)

    return db.scalars(statement).all()

@router.get("/{employee_id}", response_model=EmployeeRead)
def view_employee(employee_id : int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_employee(employee_id, db)

@router.post("/", response_model=EmployeeRead, status_code=201)
def create_employee(employee_data: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    employee_email = str(employee_data.email).lower()

    statement = select(Employee).where(
        func.lower(Employee.email) == employee_email
    )

    existing_employee = db.scalar(statement)

    if existing_employee is not None:
        raise HTTPException(
            status_code=400,
            detail="Employee email already registered."
        )

    employee = Employee(**employee_data.model_dump())

    try:
        db.add(employee)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Employee email already registered."
        )

    db.refresh(employee)

    return employee

@router.patch("/{employee_id}", response_model=EmployeeRead)
def patch_employee(employee_id: int, employee_data: EmployeeUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    employee = get_employee(employee_id, db)

    updates = employee_data.model_dump(exclude_unset=True)

    if "email" in updates:
        normalized_email = str(updates["email"]).lower()

        duplicate = db.scalar(
            select(Employee).where(
                func.lower(Employee.email) == normalized_email,
                Employee.id != employee_id,
            )
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Employee email already registered.",
            )

        updates["email"] = normalized_email

    for field, value in updates.items():
        setattr(employee, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Employee email already registered.",
        )

    db.refresh(employee)
    return employee

@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id : int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    employee = get_employee(employee_id, db)

    db.delete(employee)
    db.commit()