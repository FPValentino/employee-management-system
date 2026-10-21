from app.security import (
    create_access_token,
    hash_password,
    verify_password,
)


def test_password_is_hashed():
    plain_password = "Password123!"

    stored_hash = hash_password(plain_password)

    assert stored_hash != plain_password
    assert verify_password(plain_password, stored_hash)
    assert not verify_password("WrongPassword123!", stored_hash)


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_successful_registration(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "new-user@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "new-user@example.com"
    assert data["role"] == "employee"
    assert "password_hash" not in data


def test_duplicate_email_registration(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
    }

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered."


def test_successful_login(client):
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "Password123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_invalid_login_credentials(client):
    client.post(
        "/auth/register",
        json={
            "email": "invalid-login@example.com",
            "password": "Password123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "invalid-login@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401


def test_auth_me_with_valid_token(client):
    client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "password": "Password123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "me@example.com",
            "password": "Password123!",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"
    assert response.json()["role"] == "employee"


def test_auth_me_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_with_invalid_token(client):
    response = client.get(
        "/auth/me",
        headers={
            "Authorization": "Bearer invalid-token"
        },
    )

    assert response.status_code == 401


def test_auth_me_with_nonexistent_user(client):
    token = create_access_token({"sub": "999999"})

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 401