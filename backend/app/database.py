from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Create Engine (Neon PostgreSQL Recommended Settings)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Check connection before using it
    pool_recycle=300,        # Recycle every 5 minutes
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_reset_on_return="commit"
)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base Class
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()