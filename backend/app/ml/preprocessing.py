from pathlib import Path

import cv2
import numpy as np


# Supported image extensions
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


class ImagePreprocessingError(Exception):
    """Raised when an image cannot be preprocessed."""


def validate_image(image_path: str | Path) -> Path:
    """
    Validate that the image exists and is a supported format.
    """
    image_path = Path(image_path)

    if not image_path.exists():
        raise ImagePreprocessingError(
            f"Image not found: {image_path}"
        )

    if image_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ImagePreprocessingError(
            f"Unsupported image format: {image_path.suffix}"
        )

    return image_path


def load_image(image_path: str | Path) -> np.ndarray:
    """
    Read image using OpenCV.
    """
    image_path = validate_image(image_path)

    image = cv2.imread(str(image_path))

    if image is None:
        raise ImagePreprocessingError(
            "Unable to load image."
        )

    return image


def convert_to_rgb(image: np.ndarray) -> np.ndarray:
    """
    Convert OpenCV BGR image to RGB.
    """
    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB,
    )


def resize_image(
    image: np.ndarray,
    target_size=(224, 224),
) -> np.ndarray:
    """
    Resize image for AI model input.
    """
    return cv2.resize(
        image,
        target_size,
        interpolation=cv2.INTER_AREA,
    )


def normalize_image(
    image: np.ndarray,
) -> np.ndarray:
    """
    Normalize pixel values to [0,1].
    """
    return image.astype(np.float32) / 255.0


def create_tensor(
    image: np.ndarray,
) -> np.ndarray:
    """
    Add batch dimension.
    Shape:
        (224,224,3)
    becomes
        (1,224,224,3)
    """
    return np.expand_dims(
        image,
        axis=0,
    )


def preprocess_image(
    image_path: str | Path,
    target_size=(224, 224),
) -> np.ndarray:
    """
    Complete preprocessing pipeline.
    """

    image = load_image(image_path)

    image = convert_to_rgb(image)

    image = resize_image(
        image,
        target_size,
    )

    image = normalize_image(image)

    tensor = create_tensor(image)

    return tensor