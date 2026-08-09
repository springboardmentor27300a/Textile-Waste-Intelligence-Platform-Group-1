import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models.inventory import Inventory
from app.models.users import User

db = SessionLocal()
inv_count = db.query(Inventory).count()
user = db.query(User).first()
print(f"Inventory Count: {inv_count}")
if user:
    print(f"User found: {user.email} (ID: {user.id})")
else:
    print("No user found!")
