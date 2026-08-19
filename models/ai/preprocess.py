import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# -----------------------------
# Dataset Configuration
# -----------------------------
DATASET_PATH = "datasets/Biodegradable Fabrics"
IMAGE_SIZE = (128, 128)

images = []
labels = []

print("Loading Dataset...")

# -----------------------------
# Read Dataset
# -----------------------------
for folder in os.listdir(DATASET_PATH):

    folder_path = os.path.join(DATASET_PATH, folder)

    if not os.path.isdir(folder_path):
        continue

    print(f"Reading Folder : {folder}")

    for image_name in os.listdir(folder_path):

        image_path = os.path.join(folder_path, image_name)

        image = cv2.imread(image_path)

        if image is None:
            continue

        # Resize Image
        image = cv2.resize(image, IMAGE_SIZE)

        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Normalize
        image = image.astype("float32") / 255.0

        images.append(image)
        labels.append(folder)

print("Images Loaded Successfully")

# -----------------------------
# Convert into NumPy Arrays
# -----------------------------
images = np.array(images)
labels = np.array(labels)

print("Total Images :", len(images))

# -----------------------------
# Encode Labels
# -----------------------------
encoder = LabelEncoder()

labels = encoder.fit_transform(labels)

print("Classes :")
print(encoder.classes_)

# -----------------------------
# Split Dataset
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    images,
    labels,
    test_size=0.20,
    random_state=42,
    stratify=labels
)

print("Training Images :", len(X_train))
print("Testing Images :", len(X_test))

# -----------------------------
# Return Dataset
# -----------------------------
def load_dataset():

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        encoder
    )