"""
Development-safe schema compatibility helper.

SQLAlchemy's Base.metadata.create_all() does not modify
existing PostgreSQL tables.

The project has accumulated model columns over multiple
milestones, so an old database can otherwise fail with
UndefinedColumn errors.

This helper adds missing non-primary-key columns as
nullable columns.

It does not delete, rename, or alter existing data.
"""

from sqlalchemy import inspect, text

from app.database.database import Base, engine


def ensure_schema_compatibility():
    inspector = inspect(engine)

    existing_tables = set(
        inspector.get_table_names()
    )

    with engine.begin() as connection:

        for table in Base.metadata.sorted_tables:

            table_name = table.name

            if table_name not in existing_tables:
                continue

            existing_columns = {
                column["name"]
                for column in inspector.get_columns(
                    table_name
                )
            }

            for column in table.columns:

                if column.name in existing_columns:
                    continue

                # Never attempt to create a missing
                # primary key here.
                if column.primary_key:
                    continue

                column_type = column.type.compile(
                    dialect=engine.dialect
                )

                sql = (
                    f'ALTER TABLE "{table_name}" '
                    f'ADD COLUMN "{column.name}" '
                    f'{column_type}'
                )

                connection.execute(
                    text(sql)
                )

                print(
                    f"[TWIP] Added missing column "
                    f"{table_name}.{column.name}"
                )