import sys
import os
from datetime import date, timedelta

# Add parent directory to path so app modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import SessionLocal, engine, Base
from app.models.models import Role, User, Inventory, WasteBatch, TextileWaste
from app.utils.security import get_password_hash

def seed_db():
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Roles
        roles_to_create = [
            "Administrator",
            "Recycling Facility Operator",
            "Sustainability Manager",
            "Textile Manufacturer"
        ]
        
        roles_dict = {}
        for role_name in roles_to_create:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
                print(f"Created role: {role_name}")
            else:
                print(f"Role already exists: {role_name}")
            roles_dict[role_name] = role

        # 2. Seed Users (One per role)
        users_data = [
            {
                "email": "admin@textilewaste.org",
                "full_name": "Sarah Connor (Admin)",
                "password": "admin123",
                "role_name": "Administrator"
            },
            {
                "email": "operator@textilewaste.org",
                "full_name": "John Doe (Operator)",
                "password": "operator123",
                "role_name": "Recycling Facility Operator"
            },
            {
                "email": "manager@textilewaste.org",
                "full_name": "Elena Rostova (Manager)",
                "password": "manager123",
                "role_name": "Sustainability Manager"
            },
            {
                "email": "manufacturer@textilewaste.org",
                "full_name": "Marcus Aurelius (Manufacturer)",
                "password": "manufacturer123",
                "role_name": "Textile Manufacturer"
            }
        ]

        users_dict = {}
        for user_info in users_data:
            user = db.query(User).filter(User.email == user_info["email"]).first()
            if not user:
                user = User(
                    email=user_info["email"],
                    full_name=user_info["full_name"],
                    hashed_password=get_password_hash(user_info["password"]),
                    role_id=roles_dict[user_info["role_name"]].id
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"Created user: {user_info['email']} with role {user_info['role_name']}")
            else:
                print(f"User already exists: {user_info['email']}")
            users_dict[user_info["role_name"]] = user

        # 3. Seed Inventory Storage Locations
        storages = [
            {"location_name": "Main Warehouse - Zone A", "capacity_kg": 10000.0},
            {"location_name": "Recycling Hub - Section B", "capacity_kg": 5000.0},
            {"location_name": "Processing Depot - Section C", "capacity_kg": 8000.0}
        ]
        
        inventories = []
        for store in storages:
            inv = db.query(Inventory).filter(Inventory.location_name == store["location_name"]).first()
            if not inv:
                inv = Inventory(location_name=store["location_name"], capacity_kg=store["capacity_kg"])
                db.add(inv)
                db.commit()
                db.refresh(inv)
                print(f"Created inventory location: {store['location_name']}")
            inventories.append(inv)

        # 4. Seed 10 Textile Waste Batches
        operator_user = users_dict["Recycling Facility Operator"]
        today = date.today()

        batches_data = [
            {
                "fabric_type": "Cotton",
                "source": "Industrial",
                "quantity": 450.0,
                "color": "White",
                "condition": "Clean",
                "collection_date": today - timedelta(days=12),
                "status": "Collected",
                "inventory_id": inventories[0].id,
                "wastes": [{"material_composition": "100% Organic Cotton", "recyclability_rate": 0.95, "has_contaminants": False}]
            },
            {
                "fabric_type": "Polyester",
                "source": "Pre-consumer",
                "quantity": 1200.0,
                "color": "Navy Blue",
                "condition": "Clean",
                "collection_date": today - timedelta(days=9),
                "status": "Sorting",
                "inventory_id": inventories[0].id,
                "wastes": [{"material_composition": "100% Recycled Polyester", "recyclability_rate": 0.85, "has_contaminants": False}]
            },
            {
                "fabric_type": "Wool",
                "source": "Post-consumer",
                "quantity": 300.0,
                "color": "Mixed Earth Tones",
                "condition": "Damaged",
                "collection_date": today - timedelta(days=7),
                "status": "Processing",
                "inventory_id": inventories[1].id,
                "wastes": [{"material_composition": "80% Wool / 20% Nylon", "recyclability_rate": 0.70, "has_contaminants": True}]
            },
            {
                "fabric_type": "Nylon",
                "source": "Industrial",
                "quantity": 850.0,
                "color": "Black",
                "condition": "Clean",
                "collection_date": today - timedelta(days=5),
                "status": "Recycled",
                "inventory_id": inventories[2].id,
                "wastes": [{"material_composition": "100% Industrial Nylon 6", "recyclability_rate": 0.98, "has_contaminants": False}]
            },
            {
                "fabric_type": "Poly-Cotton Blend",
                "source": "Pre-consumer",
                "quantity": 600.0,
                "color": "Red",
                "condition": "Clean",
                "collection_date": today - timedelta(days=4),
                "status": "Collected",
                "inventory_id": inventories[0].id,
                "wastes": [{"material_composition": "60% Cotton / 40% Polyester", "recyclability_rate": 0.55, "has_contaminants": False}]
            },
            {
                "fabric_type": "Silk",
                "source": "Post-consumer",
                "quantity": 120.0,
                "color": "Pink",
                "condition": "Clean",
                "collection_date": today - timedelta(days=3),
                "status": "Collected",
                "inventory_id": inventories[1].id,
                "wastes": [{"material_composition": "100% Pure Mulberry Silk", "recyclability_rate": 0.80, "has_contaminants": False}]
            },
            {
                "fabric_type": "Linen",
                "source": "Industrial",
                "quantity": 400.0,
                "color": "Beige",
                "condition": "Clean",
                "collection_date": today - timedelta(days=15),
                "status": "Recycled",
                "inventory_id": inventories[2].id,
                "wastes": [{"material_composition": "100% Organic Flax Linen", "recyclability_rate": 0.90, "has_contaminants": False}]
            },
            {
                "fabric_type": "Acrylic",
                "source": "Pre-consumer",
                "quantity": 750.0,
                "color": "Grey",
                "condition": "Damaged",
                "collection_date": today - timedelta(days=8),
                "status": "Disposed",
                "inventory_id": None,
                "wastes": [{"material_composition": "100% Polyacrylic fibers", "recyclability_rate": 0.30, "has_contaminants": True}]
            },
            {
                "fabric_type": "Cotton-Wool Blend",
                "source": "Post-consumer",
                "quantity": 280.0,
                "color": "Checkered",
                "condition": "Damaged",
                "collection_date": today - timedelta(days=10),
                "status": "Sorting",
                "inventory_id": inventories[1].id,
                "wastes": [{"material_composition": "50% Cotton / 50% Wool", "recyclability_rate": 0.65, "has_contaminants": True}]
            },
            {
                "fabric_type": "Denim",
                "source": "Pre-consumer",
                "quantity": 950.0,
                "color": "Indigo",
                "condition": "Clean",
                "collection_date": today - timedelta(days=1),
                "status": "Processing",
                "inventory_id": inventories[0].id,
                "wastes": [{"material_composition": "98% Cotton / 2% Elastane Denim", "recyclability_rate": 0.88, "has_contaminants": False}]
            }
        ]

        # Clear existing batches to make seeding idempotent/clean
        db.query(TextileWaste).delete()
        db.query(WasteBatch).delete()
        db.commit()

        for idx, batch_info in enumerate(batches_data):
            batch = WasteBatch(
                fabric_type=batch_info["fabric_type"],
                source=batch_info["source"],
                quantity=batch_info["quantity"],
                color=batch_info["color"],
                condition=batch_info["condition"],
                collection_date=batch_info["collection_date"],
                status=batch_info["status"],
                operator_id=operator_user.id,
                inventory_id=batch_info["inventory_id"]
            )
            db.add(batch)
            db.commit()
            db.refresh(batch)
            
            for waste_w in batch_info["wastes"]:
                waste_item = TextileWaste(
                    waste_batch_id=batch.id,
                    material_composition=waste_w["material_composition"],
                    recyclability_rate=waste_w["recyclability_rate"],
                    has_contaminants=waste_w["has_contaminants"]
                )
                db.add(waste_item)
            
            db.commit()
            print(f"Seeded waste batch {idx+1}: {batch_info['fabric_type']} ({batch_info['quantity']} kg)")

        print("Database Seeded Successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
