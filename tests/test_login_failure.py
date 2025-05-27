def test_login_failure(client):
    response = client.post("/login", data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 401
