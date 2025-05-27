import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db
from backend import models
from backend.auth import pwd_context

# Use an in-memory SQLite DB for isolated test environment
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override for the test DB
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Setup: Create tables
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    # Teardown: Drop all tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_users(client):
    db = TestingSessionLocal()
    db.query(models.User).delete()
    db.add_all([
        models.User(name="admin", hashed_password=pwd_context.hash("admin"), is_admin=True),
        models.User(name="user", hashed_password=pwd_context.hash("password"), is_admin=False),
        models.User(name="nonadmin", hashed_password=pwd_context.hash("password"), is_admin=False),
    ])
    db.commit()
    users = db.query(models.User).all()
    print("🚀 Seeded users:", [u.name for u in users])
    db.close()


@pytest.fixture
def admin_token(client):
    response = client.post("/login", json={"name": "admin", "password": "admin"})
    assert response.status_code == 200, f"Admin login failed: {response.json()}"
    return response.json()["access_token"]

@pytest.fixture
def user_token(client):
    response = client.post("/login", json={"name": "user", "password": "password"})
    assert response.status_code == 200, f"User login failed: {response.json()}"
    return response.json()["access_token"]

@pytest.fixture
def non_admin_token(client):
    response = client.post("/login", json={"name": "nonadmin", "password": "password"})
    assert response.status_code == 200, f"Non-admin login failed: {response.json()}"
    return response.json()["access_token"]
