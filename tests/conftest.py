import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db
from backend import models
from backend.auth import pwd_context

# Use an in-memory SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override FastAPI's get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # ✅ Create tables before anything else
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    # Optionally drop tables after the module
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_users(client):  # client fixture ensures tables are created first
    db = TestingSessionLocal()
    db.add_all([
        models.User(name="admin", hashed_password=pwd_context.hash("admin"), is_admin=True),
        models.User(name="user", hashed_password=pwd_context.hash("password"), is_admin=False),
        models.User(name="nonadmin", hashed_password=pwd_context.hash("password"), is_admin=False),
    ])
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
