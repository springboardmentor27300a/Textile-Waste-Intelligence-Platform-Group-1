from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    recipient_id: int

    actor_id: Optional[int] = None

    category: str

    notification_type: str

    title: str

    message: str

    entity_type: Optional[str] = None

    entity_id: Optional[int] = None

    is_read: bool

    created_at: datetime


class NotificationStats(BaseModel):

    total: int

    unread: int

    today: int

    alerts: int