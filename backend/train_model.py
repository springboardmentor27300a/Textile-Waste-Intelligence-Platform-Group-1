"""
Train Material Classification Model (MobileNetV2)
"""
import os
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing import image_dataset_from_directory
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / "datasets" / "unified_textile_dataset"
MODELS_DIR = BASE_DIR / "app" / "models"
MODEL_PATH = MODELS_DIR / "fabric_model.h5"

BATCH_SIZE = 16
IMG_SIZE = (224, 224)

def build_model(num_classes):
    base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
    base_model.trainable = False  # Freeze base model

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    if not DATASET_DIR.exists():
        print(f"Error: Dataset directory {DATASET_DIR} not found.")
        return

    print("Loading dataset...")
    train_dataset = image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    val_dataset = image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    class_names = train_dataset.class_names
    print(f"Classes found: {class_names}")

    num_classes = len(class_names)
    if num_classes == 0:
        print("No classes found. Ensure generate_synthetic_dataset.py ran successfully.")
        return

    model = build_model(num_classes)
    
    print("Training model...")
    # Since this is a demo, 3 epochs is enough for basic training and fast execution
    model.fit(train_dataset, validation_data=val_dataset, epochs=3)
    
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save(str(MODEL_PATH))
    print(f"Model saved to {MODEL_PATH}")
    
    # Save class names mapping
    with open(MODELS_DIR / "class_names.txt", "w") as f:
        for cls in class_names:
            f.write(f"{cls}\n")
    print("Class names saved.")

if __name__ == "__main__":
    main()
