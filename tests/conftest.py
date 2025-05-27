import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)

import json

@pytest.fixture
def user_token(client):
    response = client.post("/login", data={"username": "user", "password": "password"})
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client):
    response = client.post("/login", data={"username": "admin", "password": "admin"})
    return response.json()["access_token"]

@pytest.fixture
def non_admin_token(client):
    response = client.post("/login", data={"username": "nonadmin", "password": "password"})
    return response.json()["access_token"]