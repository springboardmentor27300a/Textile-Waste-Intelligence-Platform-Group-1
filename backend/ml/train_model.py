import json
import os
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model

from preprocessing import TextileDatasetPreprocessor


DATASET_PATH = os.environ.get("TEXTILE_DATASET_PATH") or "data/tips"
if not os.path.isdir(DATASET_PATH) and os.path.isdir("data/TFD"):
    DATASET_PATH = "data/TFD"

MODEL_PATH = "ml/model.keras"
CLASS_MAPPING_PATH = "ml/class_mapping.json"
DATASET_STATS_PATH = "ml/dataset_stats.json"
EVALUATION_PATH = "ml/evaluation.json"
IMAGE_SIZE = (224, 224)
BATCH_SIZE = int(os.environ.get("TEXTILE_BATCH_SIZE", "32"))
EPOCHS = int(os.environ.get("TEXTILE_EPOCHS", "18"))

print(f"Using dataset path: {DATASET_PATH}")

processor = TextileDatasetPreprocessor(DATASET_PATH)
processor.load_images()
(
    X_train,
    X_valid,
    X_test,
    y_train,
    y_valid,
    y_test,
) = processor.split_dataset()
processor.save_class_mapping(CLASS_MAPPING_PATH)
processor.save_dataset_statistics(DATASET_STATS_PATH)

num_classes = len(np.unique(y_train))
class_counts = np.bincount(y_train)
class_weights = np.max(class_counts) / np.clip(class_counts, 1, None)
class_weight = {index: float(weight) for index, weight in enumerate(class_weights)}

train_ds = tf.data.Dataset.from_tensor_slices((X_train, y_train))
valid_ds = tf.data.Dataset.from_tensor_slices((X_valid, y_valid))

train_ds = train_ds.shuffle(len(X_train)).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
valid_ds = valid_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.12),
    layers.RandomZoom(0.10),
    layers.RandomBrightness(0.10),
    layers.RandomContrast(0.10),
])

base_model = EfficientNetB0(include_top=False, weights="imagenet", input_shape=(224, 224, 3))
base_model.trainable = False

inputs = tf.keras.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = layers.Rescaling(1.0 / 255.0)(x)

x = base_model(x, training=False)

x = GlobalAveragePooling2D()(x)

x = Dropout(0.35)(x)

outputs = Dense(num_classes, activation="softmax")(x)

model = Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks = [
    EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6),
    ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor="val_loss"),
]

history = model.fit(
    train_ds,
    validation_data=valid_ds,
    epochs=EPOCHS,
    callbacks=callbacks,
    class_weight=class_weight,
)

# Fine-tune the last block of the EfficientNet backbone.
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

fine_tune_history = model.fit(
    train_ds,
    validation_data=valid_ds,
    epochs=min(EPOCHS + 6, 24),
    callbacks=[
        EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.2, patience=2, min_lr=1e-6),
        ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor="val_loss"),
    ],
    class_weight=class_weight,
)

loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
predictions = model.predict(X_test, verbose=0)
predicted_classes = np.argmax(predictions, axis=1)

report = classification_report(y_test, predicted_classes, output_dict=True, zero_division=0)
conf_matrix = confusion_matrix(y_test, predicted_classes)

evaluation = {
    "test_loss": float(loss),
    "test_accuracy": float(accuracy),
    "classification_report": report,
    "confusion_matrix": conf_matrix.tolist(),
}
with open(EVALUATION_PATH, "w") as file:
    json.dump(evaluation, file, indent=4)

combined_history = {
    "initial": history.history,
    "fine_tune": fine_tune_history.history,
}
with open("ml/history.json", "w") as file:
    json.dump(combined_history, file, indent=4)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].plot(history.history.get("accuracy", []), label="train")
axes[0].plot(history.history.get("val_accuracy", []), label="val")
axes[0].set_title("Accuracy")
axes[0].set_xlabel("Epoch")
axes[0].set_ylabel("Accuracy")
axes[0].legend()
axes[1].plot(history.history.get("loss", []), label="train")
axes[1].plot(history.history.get("val_loss", []), label="val")
axes[1].set_title("Loss")
axes[1].set_xlabel("Epoch")
axes[1].set_ylabel("Loss")
axes[1].legend()
fig.tight_layout()
fig.savefig("ml/training_history.png")
plt.close(fig)

print("\nTraining Completed Successfully")
print("Saved Model      :", MODEL_PATH)
print("Training History : ml/history.json")
print("Evaluation Report: ml/evaluation.json")