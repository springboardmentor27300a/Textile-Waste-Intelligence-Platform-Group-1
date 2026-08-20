import os
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras import layers, models

# ==============================
# Dataset Configuration
# ==============================
DATASET_PATH = r"C:\Users\goddu\Downloads\fabric_dataset"

IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 16
EPOCHS = 10

# ==============================
# Load Dataset
# ==============================
train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
)

class_names = train_ds.class_names

print("\n===================================")
print("Dataset Loaded Successfully")
print("Classes:", class_names)
print("===================================\n")

# ==============================
# Improve Performance
# ==============================
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.cache().shuffle(1000).prefetch(AUTOTUNE)
val_ds = val_ds.cache().prefetch(AUTOTUNE)

# ==============================
# Data Augmentation
# ==============================
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])

# ==============================
# Build CNN Model
# ==============================
model = models.Sequential([

    tf.keras.Input(shape=(224,224,3)),

    data_augmentation,

    layers.Rescaling(1./255),

    layers.Conv2D(32,3,activation="relu"),
    layers.MaxPooling2D(),

    layers.Conv2D(64,3,activation="relu"),
    layers.MaxPooling2D(),

    layers.Conv2D(128,3,activation="relu"),
    layers.MaxPooling2D(),

    layers.Flatten(),

    layers.Dense(128,activation="relu"),

    layers.Dropout(0.5),

    layers.Dense(2,activation="softmax")
])

# ==============================
# Compile Model
# ==============================
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ==============================
# Train Model
# ==============================
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

# ==============================
# Save Model
# ==============================
MODEL_PATH = r"C:\Projects\textile_waste_platform\backend\ai\models\fabric_defect_model.keras"

model.save(MODEL_PATH)

print("\n===================================")
print("Model Saved Successfully")
print(MODEL_PATH)
print("===================================\n")

# ==============================
# Plot Accuracy
# ==============================
plt.figure(figsize=(10,5))

plt.plot(history.history["accuracy"],label="Training Accuracy")
plt.plot(history.history["val_accuracy"],label="Validation Accuracy")

plt.xlabel("Epoch")
plt.ylabel("Accuracy")

plt.title("Training Accuracy")

plt.legend()

plt.show()