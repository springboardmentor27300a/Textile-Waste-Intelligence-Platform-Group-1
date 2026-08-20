import os
import gc

# Force TensorFlow to use CPU on Render
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import numpy as np
import tensorflow as tf
from PIL import Image

# Hide GPU devices
try:
    tf.config.set_visible_devices([], "GPU")
except Exception:
    pass


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "fabric_defect_model.keras"
)

CLASS_NAMES = ["Defect", "NoDefect"]


def get_model():
    print("Loading fabric defect model...")
    return tf.keras.models.load_model(MODEL_PATH)


def predict_image(image_path):

    model = get_model()

    try:
        img = Image.open(image_path).convert("RGB")
        img = img.resize((224, 224))

        img = np.array(img, dtype=np.float32) / 255.0
        img = np.expand_dims(img, axis=0)

        prediction = model.predict(img, verbose=0)

        predicted_class = CLASS_NAMES[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        return {
            "prediction": predicted_class,
            "confidence": round(confidence * 100, 2)
        }

    finally:
        del model
        tf.keras.backend.clear_session()
        gc.collect()


if __name__ == "__main__":

    image = input("Enter image path: ").strip().strip('"')

    result = predict_image(image)

    print(result)