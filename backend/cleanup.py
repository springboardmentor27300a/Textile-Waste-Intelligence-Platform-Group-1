import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import (
    User, Supplier, Inventory, WasteRecord, TextileImage, 
    SustainabilityMetric, RecyclingRecommendation, 
    EnvironmentalReport, CircularEconomyAnalytics
)

def cleanup_db():
    db = SessionLocal()
    try:
        # Delete demo data from all tables
        db.query(Inventory).delete()
        db.query(WasteRecord).delete()
        db.query(TextileImage).delete()
        db.query(SustainabilityMetric).delete()
        db.query(RecyclingRecommendation).delete()
        db.query(EnvironmentalReport).delete()
        db.query(CircularEconomyAnalytics).delete()
        db.query(Supplier).delete()
        
        # Keep only the main user
        email_to_keep = "varshiniyerramsetti109@gmail.com"
        db.query(User).filter(User.email != email_to_keep).delete()
        
        # Verify no duplicate main user
        main_users = db.query(User).filter(User.email == email_to_keep).all()
        if len(main_users) > 1:
            print(f"Warning: Found {len(main_users)} users with email {email_to_keep}. Keeping only the first one.")
            for duplicate in main_users[1:]:
                db.delete(duplicate)
                
        db.commit()

        # Print summary
        user_count = db.query(User).count()
        inventory_count = db.query(Inventory).count()
        waste_count = db.query(WasteRecord).count()
        reports_count = db.query(TextileImage).count()
        analytics_count = db.query(SustainabilityMetric).count()
        
        print("Cleanup completed successfully.")
        print(f"• Number of users remaining: {user_count}")
        print(f"• Inventory count: {inventory_count}")
        print(f"• Waste records count: {waste_count}")
        print(f"• Reports count: {reports_count}")
        print(f"• Analytics count: {analytics_count}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_db()
