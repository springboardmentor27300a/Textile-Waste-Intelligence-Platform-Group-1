import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import urlparse, urlunparse

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to auto-create database if it doesn't exist
def ensure_database_exists():
    db_url = settings.DATABASE_URL
    if not db_url.startswith("postgresql"):
        return # Skip for non-postgres URLs (like sqlite for testing)
        
    parsed_url = urlparse(db_url)
    db_name = parsed_url.path.lstrip("/")
    
    # Reconstruct URL to connect to the default 'postgres' database
    postgres_netloc = parsed_url.netloc
    postgres_url = urlunparse((
        parsed_url.scheme,
        postgres_netloc,
        "/postgres",
        parsed_url.params,
        parsed_url.query,
        parsed_url.fragment
    ))
    
    temp_engine = create_engine(postgres_url, isolation_level="AUTOCOMMIT")
    try:
        with temp_engine.connect() as conn:
            # Check if db exists
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
            exists = result.scalar()
            if not exists:
                logger.info(f"Database '{db_name}' does not exist. Creating...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                logger.info(f"Database '{db_name}' created successfully.")
            else:
                logger.info(f"Database '{db_name}' already exists.")
    except Exception as e:
        logger.warning(f"Could not auto-create database '{db_name}': {e}. Proceeding assuming it exists.")
    finally:
        temp_engine.dispose()

# Run the database verification
try:
    ensure_database_exists()
except Exception:
    pass

# Setup primary SQLAlchemy Engine and Session
db_url = settings.DATABASE_URL
engine = None

try:
    # Test PostgreSQL connection
    test_engine = create_engine(db_url, pool_pre_ping=True)
    with test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = test_engine
    logger.info(f"Database connection established successfully: {db_url}")
except Exception as e:
    # If PostgreSQL connection fails and we are using the default local URL, fallback to SQLite
    if "postgresql" in db_url and "localhost" in db_url:
        sqlite_url = "sqlite:///./weavecycle.db"
        logger.warning(
            f"Could not connect to PostgreSQL on localhost ({e}). "
            f"Falling back to local SQLite database: {sqlite_url}"
        )
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    else:
        # Re-raise for custom database URLs to notify configuration errors
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
