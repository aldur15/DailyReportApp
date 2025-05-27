def test_login_success(client):
    response = client.post("/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    assert "access_token" in response.json()
