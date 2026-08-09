import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def reset_ids():
    with engine.begin() as conn:
        # Update the single user's ID to 1
        conn.execute(text("UPDATE users SET id = 1;"))
        print("Successfully updated user ID to 1.")

if __name__ == "__main__":
    reset_ids()
