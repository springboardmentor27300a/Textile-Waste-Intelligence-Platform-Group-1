# -*- coding: utf-8 -*-
"""
Seed script: populates the database with default users, suppliers,
inventory records, and waste data from the synthetic CSV dataset.

Run from backend/ directory:
    python -m app.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import csv
import random
from datetime import datetime, timedelta
from app.database import SessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.supplier import Supplier
from app.models.inventory import Inventory, InventoryStatus, MaterialGrade
from app.models.waste_record import WasteRecord, WasteType, DisposalMethod
from app.services.auth_service import hash_password


def seed():
    create_tables()
    db = SessionLocal()

    try:
        # ── Default Users ─────────────────────────────────────────────────────
        default_users = [
            {"email": "admin@texwaste.com",    "full_name": "Alice Admin",    "password": "admin123",    "role": UserRole.admin},
            {"email": "analyst@texwaste.com",  "full_name": "Bob Analyst",    "password": "analyst123",  "role": UserRole.analyst},
            {"email": "supplier@texwaste.com", "full_name": "Carlos Supplier","password": "supplier123", "role": UserRole.supplier},
            {"email": "auditor@texwaste.com",  "full_name": "Diana Auditor",  "password": "auditor123",  "role": UserRole.auditor},
        ]
        for u in default_users:
            if not db.query(User).filter(User.email == u["email"]).first():
                user = User(
                    email=u["email"],
                    full_name=u["full_name"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                )
                db.add(user)
        db.commit()
        print("[OK] Default users seeded")

        # ── Suppliers ──────────────────────────────────────────────────────────
        suppliers_data = [
            {"name": "GreenThread Bangladesh",  "contact_email": "contact@greenthread.bd", "country": "Bangladesh", "certification": "GOTS",     "waste_rating": 4.2},
            {"name": "EcoFabrics India",        "contact_email": "info@ecofabrics.in",     "country": "India",      "certification": "OEKO-TEX", "waste_rating": 3.8},
            {"name": "VietTex Corp",            "contact_email": "hello@viettex.vn",       "country": "Vietnam",    "certification": "ISO 14001","waste_rating": 4.5},
            {"name": "ChinaSilk Ltd",           "contact_email": "cs@chinasilk.cn",        "country": "China",      "certification": "BLUESIGN", "waste_rating": 3.1},
            {"name": "TurkoTextile A.Ş.",       "contact_email": "info@turkotex.tr",       "country": "Turkey",     "certification": "GOTS",     "waste_rating": 4.0},
            {"name": "PeruWool Exports",        "contact_email": "exports@peruwool.pe",    "country": "Peru",       "certification": "RWS",      "waste_rating": 4.7},
            {"name": "MoroccoCotton SARL",      "contact_email": "sales@moroccocot.ma",   "country": "Morocco",    "certification": "OEKO-TEX", "waste_rating": 3.5},
        ]
        supplier_ids = []
        for s in suppliers_data:
            existing = db.query(Supplier).filter(Supplier.name == s["name"]).first()
            if not existing:
                supplier = Supplier(**s)
                db.add(supplier)
                db.flush()
                supplier_ids.append(supplier.id)
            else:
                supplier_ids.append(existing.id)
        db.commit()
        print("[OK] Suppliers seeded")

        # ── Load CSV dataset ──────────────────────────────────────────────────
        csv_path = os.path.join(os.path.dirname(__file__), "data", "textile_waste_dataset.csv")
        admin = db.query(User).filter(User.role == UserRole.admin).first()

        if os.path.exists(csv_path) and admin:
            with open(csv_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                inv_count = 0
                waste_count = 0
                for row in reader:
                    # Create inventory if batch_code doesn't exist
                    batch = row.get("batch_code", "")
                    if batch and not db.query(Inventory).filter(Inventory.batch_code == batch).first():
                        inv = Inventory(
                            batch_code=batch,
                            material_type=row.get("material_type", "cotton"),
                            quantity_kg=float(row.get("quantity_kg", 100)),
                            color=row.get("color", "raw"),
                            grade=row.get("grade", "A"),
                            location=row.get("location", "Warehouse A"),
                            status=row.get("status", "active"),
                            supplier_id=random.choice(supplier_ids),
                            created_by_id=admin.id,
                        )
                        db.add(inv)
                        db.flush()
                        inv_count += 1

                        # Create associated waste record
                        wr = WasteRecord(
                            waste_type=row.get("waste_type", "fabric_scraps"),
                            quantity_kg=float(row.get("waste_kg", 10)),
                            disposal_method=row.get("disposal_method", "recycled"),
                            recycled_percentage=float(row.get("recycled_percentage", 50)),
                            co2_equivalent_kg=float(row.get("co2_equivalent_kg", 5)),
                            period_month=int(row.get("period_month", 1)),
                            period_year=int(row.get("period_year", 2024)),
                            inventory_id=inv.id,
                            recorded_by_id=admin.id,
                        )
                        db.add(wr)
                        waste_count += 1

                db.commit()
                print(f"[OK] Dataset seeded: {inv_count} inventory + {waste_count} waste records")
        else:
            print("[WARN] CSV dataset not found - skipping dataset seed")

        print("\n[DONE] Database seeding complete!")
        print("\n[INFO] Default Login Credentials:")
        for u in default_users:
            print(f"   {u['role'].value:10s} → {u['email']} / {u['password']}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
