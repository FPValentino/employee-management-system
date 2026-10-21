import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import delete
from app.security import hash_password
from datetime import date

backend_directory = Path(__file__).resolve().parents[1]
load_dotenv(backend_directory / ".env")

# Point tests to the separate Docker PostgreSQL database.
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["POSTGRES_PORT"] = "5433"
os.environ["POSTGRES_DB"] = "employee_management_test"

# Use a test-only JWT secret.
os.environ["JWT_SECRET_KEY"] = "test-only-secret-key"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_EXPIRE_MINUTES"] = "30"

from app.database import Base, SessionLocal, engine, get_db
from app.main import app
from app.models.employee import Employee
from app.models.user import User


Base.metadata.create_all(bind=engine)


def override_get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def clear_database():
    with SessionLocal() as db:
        db.execute(delete(Employee))
        db.execute(delete(User))
        db.commit()


@pytest.fixture(autouse=True)
def clean_database():
    clear_database()
    yield
    clear_database()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def create_user():
    def factory(
        email="fixture@example.com",
        password="Password123!",
        role="employee",
    ):
        with SessionLocal() as db:
            user = User(
                email=email,
                password_hash=hash_password(password),
                role=role,
            )

            db.add(user)
            db.commit()
            db.refresh(user)

            return {
                "id": user.id,
                "email": email,
                "password": password,
                "role": role,
            }

    return factory


@pytest.fixture
def login_headers(client):
    def factory(email, password):
        response = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )

        assert response.status_code == 200

        token = response.json()["access_token"]

        return {
            "Authorization": f"Bearer {token}"
        }

    return factory


@pytest.fixture
def employee_payload():
    return {
        "first_name": "Test",
        "last_name": "Employee",
        "job_title": "Backend Developer",
        "email": "test.employee@example.com",
        "phone_number": "+63 900 000 0000",
        "employment_type": "full-time",
        "department": "IT",
        "hire_date": "2026-01-15",
        "status": True,
    }


@pytest.fixture
def create_employee():
    def factory(**overrides):
        values = {
            "first_name": "Existing",
            "last_name": "Employee",
            "job_title": "Developer",
            "email": "existing.employee@example.com",
            "phone_number": "+63 911 111 1111",
            "employment_type": "full-time",
            "department": "IT",
            "hire_date": date(2025, 1, 15),
            "status": True,
        }

        values.update(overrides)

        with SessionLocal() as db:
            employee = Employee(**values)
            db.add(employee)
            db.commit()
            db.refresh(employee)

            return {
                "id": employee.id,
                **values,
            }

    return factory


@pytest.fixture
def admin_headers(client, create_user, login_headers):
    credentials = create_user(
        email="admin.fixture@example.com",
        password="AdminPassword123!",
        role="admin",
    )

    return login_headers(
        credentials["email"],
        credentials["password"],
    )


@pytest.fixture
def employee_headers(client, create_user, login_headers):
    credentials = create_user(
        email="employee.fixture@example.com",
        password="EmployeePassword123!",
        role="employee",
    )

    return login_headers(
        credentials["email"],
        credentials["password"],
    )