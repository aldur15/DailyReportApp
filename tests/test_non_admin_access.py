def test_non_admin_access(client):
    response = client.post("/login", json={"name": "nonadmin", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.json()