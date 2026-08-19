import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

from preprocess import load_dataset

# -----------------------------
# Load Dataset
# -----------------------------
X_train, X_test, y_train, y_test, encoder = load_dataset()

print("Dataset Loaded Successfully")
print("Training Images :", len(X_train))
print("Testing Images :", len(X_test))

# -----------------------------
# Build CNN Model
# -----------------------------
model = Sequential([

    Conv2D(
        32,
        (3,3),
        activation="relu",
        input_shape=(128,128,3)
    ),

    MaxPooling2D((2,2)),

    Conv2D(
        64,
        (3,3),
        activation="relu"
    ),

    MaxPooling2D((2,2)),

    Conv2D(
        128,
        (3,3),
        activation="relu"
    ),

    MaxPooling2D((2,2)),

    Flatten(),

    Dense(
        128,
        activation="relu"
    ),

    Dropout(0.5),

    Dense(
        6,
        activation="softmax"
    )

])

# -----------------------------
# Compile Model
# -----------------------------
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# -----------------------------
# Early Stopping
# -----------------------------
early_stop = EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True
)

# -----------------------------
# Train Model
# -----------------------------
history = model.fit(

    X_train,
    y_train,

    validation_data=(X_test, y_test),

    epochs=15,

    batch_size=16,

    callbacks=[early_stop]

)

# -----------------------------
# Evaluate Model
# -----------------------------
loss, accuracy = model.evaluate(X_test, y_test)

print("\nTest Accuracy :", accuracy*100)

# -----------------------------
# Create models folder
# -----------------------------
os.makedirs("models", exist_ok=True)

# -----------------------------
# Save Model
# -----------------------------
model.save("models/model.keras")

print("\nModel Saved Successfully")
print("Location : models/model.keras")