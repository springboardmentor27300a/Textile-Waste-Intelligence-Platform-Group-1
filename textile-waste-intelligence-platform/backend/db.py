import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session

# Retrieve DATABASE_URL or fallback to local SQLite
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/textile_waste_db"
)
BASE_DIR = Path(__file__).resolve().parent
FALLBACK_DATABASE_URL = f"sqlite:///{(BASE_DIR / 'textile_waste_fallback.db').as_posix()}"

# Create engine with fallback logic
try:
    # Use short connection timeout so fallback triggers quickly if Postgres is not running
    connect_args = {}
    if DATABASE_URL.startswith("postgresql"):
        connect_args = {"connect_timeout": 2}

    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
    print("SQLAlchemy: Connected successfully to PostgreSQL database!")
except Exception as e:
    print(f"SQLAlchemy: Failed to connect to PostgreSQL: {e}")
    print(f"SQLAlchemy: Falling back to persistent SQLite at: {FALLBACK_DATABASE_URL}")
    engine = create_engine(FALLBACK_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal)
Base = declarative_base()

def get_db():
    return db_session
