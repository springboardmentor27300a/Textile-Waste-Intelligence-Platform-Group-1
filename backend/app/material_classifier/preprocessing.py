"""
==========================================================
WeaveCycle - Image Preprocessing
==========================================================

Preprocess uploaded textile images before inference.

Author: WeaveCycle
"""

from pathlib import Path

import numpy as np
import tensorflow as tf

from PIL import Image


# ==========================================================
# Constants
# ==========================================================

IMAGE_SIZE = (224, 224)


# ==========================================================
# Load Image
# ==========================================================

from pathlib import Path
from PIL import Image

def load_image(image_path):

    image_path = Path(image_path).resolve()

    print(f"Loading image: {image_path}")

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(str(image_path))
    image = image.convert("RGB")

    return image


# ==========================================================
# Resize
# ==========================================================

def resize_image(image):

    return image.resize(IMAGE_SIZE)


# ==========================================================
# Convert to Array
# ==========================================================

def image_to_array(image):

    image = np.array(image, dtype=np.float32)

    return image


# ==========================================================
# EfficientNet Preprocessing
# ==========================================================

def preprocess_array(image):

    print("Before preprocessing:", image.min(), image.max())

    image = tf.keras.applications.efficientnet.preprocess_input(image)

    print("After preprocessing :", image.min(), image.max())

    return image


# ==========================================================
# Add Batch Dimension
# ==========================================================

def add_batch_dimension(image):

    return np.expand_dims(image, axis=0)


# ==========================================================
# Complete Pipeline
# ==========================================================

def preprocess_image(image_path):

    image = load_image(image_path)

    image = resize_image(image)

    image = image_to_array(image)

    image = preprocess_array(image)

    image = add_batch_dimension(image)

    return image