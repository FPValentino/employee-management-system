import time


def test_employee_list_requires_auth(client):
    response = client.get("/employees/")

    assert response.status_code == 401


def test_regular_employee_can_view_employees(
    client,
    create_employee,
    employee_headers,
):
    created_employee = create_employee()

    response = client.get(
        "/employees/",
        headers=employee_headers,
    )

    assert response.status_code == 200

    returned_ids = [
        employee["id"]
        for employee in response.json()
    ]

    assert created_employee["id"] in returned_ids


def test_regular_employee_cannot_perform_admin_actions(
    client,
    create_employee,
    employee_headers,
    employee_payload,
):
    existing_employee = create_employee()

    create_response = client.post(
        "/employees/",
        json=employee_payload,
        headers=employee_headers,
    )

    update_response = client.patch(
        f"/employees/{existing_employee['id']}",
        json={"job_title": "Unauthorized Update"},
        headers=employee_headers,
    )

    delete_response = client.delete(
        f"/employees/{existing_employee['id']}",
        headers=employee_headers,
    )

    assert create_response.status_code == 403
    assert update_response.status_code == 403
    assert delete_response.status_code == 403


def test_admin_can_create_employee(
    client,
    admin_headers,
    employee_payload,
):
    response = client.post(
        "/employees/",
        json=employee_payload,
        headers=admin_headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == employee_payload["email"]
    assert data["job_title"] == "Backend Developer"
    assert data["employment_type"] == "full-time"
    assert "password_hash" not in data


def test_invalid_employment_type_is_rejected(
    client,
    admin_headers,
    employee_payload,
):
    payload = employee_payload.copy()
    payload["employment_type"] = "temporary"

    response = client.post(
        "/employees/",
        json=payload,
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_admin_can_update_employee(
    client,
    admin_headers,
    employee_payload,
):
    create_response = client.post(
        "/employees/",
        json=employee_payload,
        headers=admin_headers,
    )

    created_employee = create_response.json()

    time.sleep(0.05)

    update_response = client.patch(
        f"/employees/{created_employee['id']}",
        json={
            "job_title": "Senior Backend Developer",
            "phone_number": "+63 922 222 2222",
        },
        headers=admin_headers,
    )

    assert update_response.status_code == 200

    updated_employee = update_response.json()

    assert updated_employee["job_title"] == "Senior Backend Developer"
    assert updated_employee["phone_number"] == "+63 922 222 2222"
    assert updated_employee["created_at"] == created_employee["created_at"]
    assert updated_employee["updated_at"] != created_employee["updated_at"]


def test_duplicate_email_during_patch_is_rejected(
    client,
    admin_headers,
    employee_payload,
):
    first_payload = employee_payload.copy()
    first_payload["email"] = "first.employee@example.com"

    second_payload = employee_payload.copy()
    second_payload["email"] = "second.employee@example.com"

    first_response = client.post(
        "/employees/",
        json=first_payload,
        headers=admin_headers,
    )

    second_response = client.post(
        "/employees/",
        json=second_payload,
        headers=admin_headers,
    )

    first_employee = first_response.json()
    second_employee = second_response.json()

    update_response = client.patch(
        f"/employees/{second_employee['id']}",
        json={"email": first_employee["email"]},
        headers=admin_headers,
    )

    assert update_response.status_code == 400
    assert update_response.json()["detail"] == (
        "Employee email already registered."
    )


def test_admin_can_delete_employee(
    client,
    admin_headers,
    employee_payload,
):
    create_response = client.post(
        "/employees/",
        json=employee_payload,
        headers=admin_headers,
    )

    employee_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/employees/{employee_id}",
        headers=admin_headers,
    )

    assert delete_response.status_code == 204

    get_response = client.get(
        f"/employees/{employee_id}",
        headers=admin_headers,
    )

    assert get_response.status_code == 404


def test_employee_search_and_filters(
    client,
    admin_headers,
    employee_payload,
):
    employees = [
        {
            "email": "backend@example.com",
            "job_title": "Backend Developer",
            "department": "IT",
            "status": True,
        },
        {
            "email": "hr@example.com",
            "job_title": "HR Assistant",
            "department": "HR",
            "status": False,
        },
        {
            "email": "frontend@example.com",
            "job_title": "Frontend Developer",
            "department": "IT",
            "status": True,
        },
    ]

    for overrides in employees:
        payload = employee_payload.copy()
        payload.update(overrides)

        response = client.post(
            "/employees/",
            json=payload,
            headers=admin_headers,
        )

        assert response.status_code == 201

    search_response = client.get(
        "/employees/",
        params={"search": "Backend"},
        headers=admin_headers,
    )

    department_response = client.get(
        "/employees/",
        params={"department": "HR"},
        headers=admin_headers,
    )

    status_response = client.get(
        "/employees/",
        params={"status": "false"},
        headers=admin_headers,
    )

    combined_response = client.get(
        "/employees/",
        params={
            "search": "Backend",
            "department": "IT",
            "status": "true",
        },
        headers=admin_headers,
    )

    assert len(search_response.json()) == 1
    assert search_response.json()[0]["email"] == "backend@example.com"

    assert len(department_response.json()) == 1
    assert department_response.json()[0]["department"] == "HR"

    assert len(status_response.json()) == 1
    assert status_response.json()[0]["status"] is False

    assert len(combined_response.json()) == 1
    assert combined_response.json()[0]["email"] == "backend@example.com"