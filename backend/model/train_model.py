import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ---------------- Dataset ---------------- #

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

dataset_path = os.path.join(
    BASE_DIR,
    "..",
    "dataset",
    "fabric_dataset"
)

print("Dataset Path:", dataset_path)
print("Path Exists:", os.path.exists(dataset_path))

train_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    dataset_path,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(224, 224),
    batch_size=32
)

validation_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    dataset_path,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(224, 224),
    batch_size=32
)

class_names = train_dataset.class_names

print("\nDetected Classes:")
print(class_names)

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.map(
    lambda x, y: (preprocess_input(x), y)
).prefetch(AUTOTUNE)

validation_dataset = validation_dataset.map(
    lambda x, y: (preprocess_input(x), y)
).prefetch(AUTOTUNE)

# ---------------- Model ---------------- #

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(len(class_names), activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=10
)

model.save(os.path.join(BASE_DIR, "fabric_model.keras"))

print("\n✅ Model Saved Successfully!")

print("\nDetected Classes:")
for i, name in enumerate(class_names):
    print(i, name)