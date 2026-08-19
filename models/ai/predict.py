import cv2
import numpy as np
import tensorflow as tf

# -----------------------------
# Load Trained Model
# -----------------------------
model = tf.keras.models.load_model("models/model.keras")

# -----------------------------
# Class Names
# -----------------------------
CLASS_NAMES = [
    "Abaca",
    "Cotton",
    "Hessian",
    "Linen",
    "Silk",
    "Wool"
]

IMAGE_SIZE = (128, 128)


def predict_fabric(image_path):

    # Read image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Image not found")

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Resize image
    image = cv2.resize(image, IMAGE_SIZE)

    # Normalize
    image = image.astype("float32") / 255.0

    # Add Batch Dimension
    image = np.expand_dims(image, axis=0)

    # Predict
    prediction = model.predict(image)

    predicted_class = np.argmax(prediction)

    confidence = float(np.max(prediction) * 100)

    return {
        "fabric_type": CLASS_NAMES[predicted_class],
        "confidence": round(confidence, 2)
    }


# -----------------------------
# Test
# -----------------------------
if __name__ == "__main__":

    image = input("Enter Image Path : ")

    result = predict_fabric(image)

    print("\nPrediction Result")
    print(result)