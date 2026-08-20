from models import ActivityLog

def log_action(db, user_id: int, username: str, action: str, detail: str):
    """
    Writes a record into the activity_logs table for compliance and audit trail monitoring.
    Safe against exceptions to prevent audit log failures from crashing core application flows.
    """
    try:
        log = ActivityLog(
            user_id=user_id,
            username=username,
            action=action,
            detail=detail
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database logging failure: {str(e)}")
