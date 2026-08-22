from sqlalchemy import text
from app.database import engine, settings

columns = [
    ("image_path", "VARCHAR"),
    ("material_rationale", "TEXT"),
    ("predicted_fabric_type", "VARCHAR"),
    ("fabric_confidence", "FLOAT"),
    ("classification_method", "VARCHAR"),
]

print("Running DB migration on engine:", engine.url)
with engine.connect() as conn:
    for col_name, col_type in columns:
        if settings.database_url.startswith("sqlite"):
            try:
                conn.execute(text(f"ALTER TABLE image_analyses ADD COLUMN {col_name} {col_type}"))
                conn.commit()
                print(f"Added {col_name} column to SQLite image_analyses table!")
            except Exception as e:
                print(f"SQLite Note ({col_name}):", e)
        else:
            try:
                conn.execute(text(f"ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                conn.commit()
                print(f"Added {col_name} column to PostgreSQL image_analyses table!")
            except Exception as e:
                print(f"PostgreSQL Note ({col_name}):", e)
