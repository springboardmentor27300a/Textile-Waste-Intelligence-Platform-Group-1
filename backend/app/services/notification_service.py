from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import pytz

from app.models.notification import Notification, NotificationType
from app.models.user import UserRole, User
from app.models.inventory import Inventory
from app.models.waste_record import WasteRecord
from app.models.recycling_recommendation import RecyclingRecommendation
from app.models.sustainability_metric import SustainabilityMetric

class NotificationService:
    @staticmethod
    def _create_notification(db: Session, title: str, message: str, n_type: NotificationType, role_target: UserRole = None, user_id: int = None):
        # Check if identical notification exists recently to avoid spam (within 24 hours)
        recent_time = datetime.now(pytz.utc) - timedelta(hours=24)
        existing = db.query(Notification).filter(
            Notification.title == title,
            Notification.role_target == role_target,
            Notification.user_id == user_id,
            Notification.created_at >= recent_time
        ).first()
        
        if existing:
            return None
            
        new_notif = Notification(
            title=title,
            message=message,
            type=n_type,
            role_target=role_target,
            user_id=user_id
        )
        db.add(new_notif)
        db.commit()
        return new_notif

    @classmethod
    def run_all_triggers(cls, db: Session):
        generated = 0
        
        # 1. Inventory Warnings
        high_inventory = db.query(Inventory).filter(Inventory.quantity_kg > 1000).all()
        for item in high_inventory:
            title = f"High Inventory Alert: {item.material_type}"
            message = f"Inventory for {item.material_type} exceeds threshold with {item.quantity_kg} kg."
            if cls._create_notification(db, title, message, NotificationType.warning, role_target=UserRole.supplier):
                generated += 1
            if cls._create_notification(db, title, message, NotificationType.warning, role_target=UserRole.admin):
                generated += 1
                
        # 2. Recycling Opportunities
        good_recs = db.query(RecyclingRecommendation).all()
        for rec in good_recs:
            title = f"New Recycling Opportunity: {rec.recommendation}"
            message = f"Recycling process '{rec.recommendation}' available for {rec.material_type} inventory."
            if cls._create_notification(db, title, message, NotificationType.info, role_target=UserRole.auditor):
                generated += 1

        # 3. Sustainability Milestones
        metrics = db.query(SustainabilityMetric).filter(SustainabilityMetric.co2_saved >= 500).all()
        for metric in metrics:
            title = f"Sustainability Milestone Reached"
            message = f"Over {metric.co2_saved} kg of carbon saved in this period!"
            if cls._create_notification(db, title, message, NotificationType.success, role_target=UserRole.analyst):
                generated += 1

        # 4. Waste Collection Alerts
        heavy_waste = db.query(WasteRecord).filter(WasteRecord.quantity_kg > 500).all()
        for waste in heavy_waste:
            title = f"Large Waste Collection Alert"
            message = f"Large waste record of {waste.quantity_kg} kg created."
            if cls._create_notification(db, title, message, NotificationType.alert, role_target=UserRole.auditor):
                generated += 1
            if cls._create_notification(db, title, message, NotificationType.alert, role_target=UserRole.admin):
                generated += 1
                
        return {"notifications_generated": generated}
