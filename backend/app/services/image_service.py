import os
import uuid
import shutil
from fastapi import UploadFile


class ImageService:
    """
    Handles image upload operations.
    """

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

    def __init__(self, upload_dir="app/uploads/images"):

        self.upload_dir = upload_dir

        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_image(self, filename: str):

        extension = os.path.splitext(filename)[1].lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise ValueError(
                "Only JPG, JPEG and PNG images are supported."
            )

    def save_image(self, image: UploadFile):

        self.validate_image(image.filename)

        extension = os.path.splitext(image.filename)[1]

        filename = f"{uuid.uuid4()}{extension}"

        file_path = os.path.join(
            self.upload_dir,
            filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

        return file_path

    def delete_image(self, file_path):

        if os.path.exists(file_path):
            os.remove(file_path)