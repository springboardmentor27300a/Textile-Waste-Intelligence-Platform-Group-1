from sqlalchemy import inspect

from app.database import Base, engine
from app.models import *


def init_database() -> None:
    print("Initializing database schema...")

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())

    print("\nDatabase schema initialized successfully.")
    print(f"Tables found: {len(tables)}")

    for table in tables:
        print(f"  - {table}")


if __name__ == "__main__":
    init_database()