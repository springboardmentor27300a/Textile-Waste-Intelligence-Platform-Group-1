import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, "dataset")
model_path = os.path.join(BASE_DIR, "fabric_model.keras")

# --------------------------------------------------
# Settings
# --------------------------------------------------

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 15

# --------------------------------------------------
# Data augmentation
# --------------------------------------------------

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.15,
    horizontal_flip=True
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2
)

# --------------------------------------------------
# Load training data
# --------------------------------------------------

train_data = train_datagen.flow_from_directory(
    dataset_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True,
    seed=42
)

# --------------------------------------------------
# Load validation data
# --------------------------------------------------

val_data = val_datagen.flow_from_directory(
    dataset_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False,
    seed=42
)

print("\nCLASS MAPPING:")
print(train_data.class_indices)

# --------------------------------------------------
# MobileNetV2 pretrained model
# --------------------------------------------------

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze pretrained layers initially
base_model.trainable = False

# --------------------------------------------------
# Classification model
# --------------------------------------------------

model = models.Sequential([
    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.3),

    layers.Dense(
        128,
        activation="relu"
    ),

    layers.Dropout(0.3),

    layers.Dense(
        train_data.num_classes,
        activation="softmax"
    )
])

# --------------------------------------------------
# Compile
# --------------------------------------------------

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.0001
    ),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# --------------------------------------------------
# Callbacks
# --------------------------------------------------

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=4,
    restore_best_weights=True
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=2,
    min_lr=0.000001
)

# --------------------------------------------------
# Train
# --------------------------------------------------

history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS,
    callbacks=[
        early_stop,
        reduce_lr
    ]
)

# --------------------------------------------------
# Save
# --------------------------------------------------

model.save(model_path)

print("\n================================")
print("MODEL SAVED SUCCESSFULLY")
print("================================")

print("\nModel path:")
print(model_path)

print("\nClasses:")
print(train_data.class_indices)

print("\nFinal training accuracy:")
print(history.history["accuracy"][-1])

print("\nFinal validation accuracy:")
print(history.history["val_accuracy"][-1])