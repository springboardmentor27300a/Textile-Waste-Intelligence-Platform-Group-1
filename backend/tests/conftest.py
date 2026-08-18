import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db

# Use an in-memory SQLite database specifically for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

from sqlalchemy.pool import StaticPool

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Creates a fresh database session for each test.
    All tables are created before the test and dropped afterwards,
    ensuring complete isolation between tests.
    """
    # Create tables in the in-memory database
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop tables to guarantee a clean slate for the next test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """
    Provides a FastAPI TestClient configured to use the isolated test database.
    Overrides the get_db dependency.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # The db_session fixture handles closing the connection
            
    # Override the application's real database connection
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
        
    # Clear overrides after the test
    app.dependency_overrides.clear()
