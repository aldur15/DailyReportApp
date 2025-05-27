import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db
from backend import models
from backend.auth import pwd_context

# ✅ Use in-memory SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Override get_db to use test session
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # ✅ Recreate tables for every test module
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_users():
    db = TestingSessionLocal()
    # ✅ Ensure fresh data
    db.query(models.User).delete()
    db.commit()

    db.add(models.User(name="admin", hashed_password=pwd_context.hash("admin"), is_admin=True))
    db.add(models.User(name="user", hashed_password=pwd_context.hash("password"), is_admin=False))
    db.add(models.User(name="nonadmin", hashed_password=pwd_context.hash("password"), is_admin=False))
    db.commit()
    db.close()

@pytest.fixture
def admin_token(client):
    response = client.post("/login", json={"name": "admin", "password": "admin"})
    return response.json()["access_token"]

@pytest.fixture
def user_token(client):
    response = client.post("/login", json={"name": "user", "password": "password"})
    return response.json()["access_token"]

@pytest.fixture
def non_admin_token(client):
    response = client.post("/login", json={"name": "nonadmin", "password": "password"})
    return response.json()["access_token"]
