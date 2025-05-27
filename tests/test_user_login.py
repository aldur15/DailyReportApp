def test_user_login(client):
    response = client.post("/login", json={"name": "user", "password": "password"})
    assert response.status_code == 200, f"Login failed: {response.json()}"
    assert "access_token" in response.json()