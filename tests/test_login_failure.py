def test_login_failure(client):
    response = client.post("/login", json={"name": "wrong", "password": "wrong"})
    assert response.status_code == 401
