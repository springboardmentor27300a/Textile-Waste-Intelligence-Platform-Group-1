from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WasteImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_id: int

    original_filename: str
    stored_filename: str
    file_path: str
    mime_type: str
    file_size_bytes: int

    is_primary: bool
    uploaded_at: datetime