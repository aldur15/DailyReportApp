import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, get_db
from backend import models
from backend.auth import pwd_context

# SQLite test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Override get_db for testing
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module", autouse=True)
def setup_users():
    db = TestingSessionLocal()
    db.add(models.User(name="admin", hashed_password=pwd_context.hash("admin"), is_admin=True))
    db.add(models.User(name="user", hashed_password=pwd_context.hash("password"), is_admin=False))
    db.add(models.User(name="nonadmin", hashed_password=pwd_context.hash("password"), is_admin=False))
    db.commit()
    db.close()

@pytest.fixture
def user_token(client):
    response = client.post("/login", json={"name": "user", "password": "password"})
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client):
    response = client.post("/login", json={"name": "admin", "password": "admin"})
    return response.json()["access_token"]

@pytest.fixture
def non_admin_token(client):
    response = client.post("/login", json={"name": "nonadmin", "password": "password"})
    return response.json()["access_token"]
