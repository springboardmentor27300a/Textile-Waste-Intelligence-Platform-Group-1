import hashlib
import json
import os
from collections import Counter

import cv2
import numpy as np
from sklearn.model_selection import train_test_split


class TextileDatasetPreprocessor:
    """
    Loads and preprocesses image datasets for textile classification.

    The preprocessor validates images, removes unreadable and duplicate files,
    and reports class distribution statistics before training.
    """

    IMAGE_SIZE = (224, 224)
    SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tif", ".tiff"}
    IGNORED_DIRS = {"train", "val", "test", "validation", "images", "imgs", "__pycache__"}

    def __init__(self, dataset_path):
        self.dataset_path = dataset_path
        self.images = []
        self.labels = []
        self.class_mapping = {}
        self.dataset_stats = {}
        self.duplicate_images = 0
        self.unreadable_images = 0

    def _normalize_label_name(self, label_name):
        label_name = os.path.basename(label_name).strip()
        label_name = label_name.replace("_", " ").replace("-", " ")
        label_name = " ".join(label_name.split())
        return label_name.title()

    def _contains_images(self, folder_path):
        for current_root, _, files in os.walk(folder_path):
            for file_name in files:
                if os.path.splitext(file_name)[1].lower() in self.SUPPORTED_EXTENSIONS:
                    return True
        return False

    def _discover_class_folders(self):
        if not self.dataset_path or not os.path.isdir(self.dataset_path):
            raise FileNotFoundError(f"Dataset path not found: {self.dataset_path}")

        direct_children = []
        for child in sorted(os.listdir(self.dataset_path)):
            child_path = os.path.join(self.dataset_path, child)
            if os.path.isdir(child_path) and child.lower() not in self.IGNORED_DIRS:
                direct_children.append(child_path)

        class_folders = {}
        for child_path in direct_children:
            if not self._contains_images(child_path):
                continue

            folder_name = self._normalize_label_name(child_path)
            if folder_name.lower() in self.IGNORED_DIRS:
                continue

            class_folders[folder_name] = child_path

        if class_folders:
            return class_folders

        roots = [self.dataset_path]
        for child in sorted(os.listdir(self.dataset_path)):
            child_path = os.path.join(self.dataset_path, child)
            if os.path.isdir(child_path):
                roots.append(child_path)

        for root in roots:
            for current_root, dirs, files in os.walk(root):
                dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS]
                if not any(os.path.splitext(f)[1].lower() in self.SUPPORTED_EXTENSIONS for f in files):
                    continue

                folder_name = self._normalize_label_name(current_root)
                if folder_name.lower() in self.IGNORED_DIRS:
                    continue
                if current_root == self.dataset_path:
                    continue
                if current_root not in class_folders.values():
                    class_folders[folder_name] = current_root

        return class_folders

    def _collect_image_files(self, folder_path):
        image_files = []
        for current_root, _, files in os.walk(folder_path):
            for file in sorted(files):
                if os.path.splitext(file)[1].lower() in self.SUPPORTED_EXTENSIONS:
                    image_files.append(os.path.join(current_root, file))
        return sorted(image_files)

    def _read_image(self, image_path):
        image = cv2.imread(image_path, cv2.IMREAD_COLOR)
        if image is None or image.size == 0:
            self.unreadable_images += 1
            return None
        return image

    def _compute_hash(self, image):
        return hashlib.sha256(image.tobytes()).hexdigest()

    def load_images(self):
        print("\nLoading Dataset...\n")
        print(f"Dataset Path : {self.dataset_path}")

        class_folders = self._discover_class_folders()
        if not class_folders:
            raise ValueError(f"No image folders were found in {self.dataset_path}")

        seen_hashes = set()
        per_class_counts = Counter()

        for label_index, (folder_name, folder_path) in enumerate(sorted(class_folders.items())):
            self.class_mapping[label_index] = folder_name

            image_files = self._collect_image_files(folder_path)
            image_count = 0
            for image_path in image_files:
                image = self._read_image(image_path)
                if image is None:
                    continue

                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                image = cv2.resize(image, self.IMAGE_SIZE)
                image = image.astype(np.float32) / 255.0

                image_hash = self._compute_hash(image)
                if image_hash in seen_hashes:
                    self.duplicate_images += 1
                    continue

                seen_hashes.add(image_hash)
                self.images.append(image)
                self.labels.append(label_index)
                image_count += 1
                per_class_counts[folder_name] += 1

            print(f"{folder_name} -> {image_count} images")

        self.images = np.array(self.images, dtype=np.float32)
        self.labels = np.array(self.labels)

        class_counts = {class_name: int(count) for class_name, count in per_class_counts.items()}
        self.dataset_stats = {
            "dataset_path": self.dataset_path,
            "total_images": int(len(self.images)),
            "classes": len(self.class_mapping),
            "class_counts": class_counts,
            "unreadable_images": int(self.unreadable_images),
            "duplicate_images": int(self.duplicate_images),
            "imbalanced": self._is_imbalanced(class_counts),
        }

        print("\nDataset Loaded Successfully")
        print(f"Total Images : {len(self.images)}")
        print(f"Classes      : {len(self.class_mapping)}")
        print(f"Unreadable Images : {self.unreadable_images}")
        print(f"Duplicate Images  : {self.duplicate_images}")
        if self.dataset_stats["imbalanced"]:
            print("Warning: Dataset classes are imbalanced. Class weights will be used during training.")

        return self.images, self.labels

    def _is_imbalanced(self, class_counts):
        if not class_counts:
            return False
        max_count = max(class_counts.values())
        if max_count <= 0:
            return False
        return any(count < max_count * 0.5 for count in class_counts.values())

    def split_dataset(self):
        if len(self.images) == 0:
            raise ValueError("No images loaded to split")

        stratify = self.labels if len(np.unique(self.labels)) > 1 and min(np.bincount(self.labels)) >= 2 else None
        X_train, X_temp, y_train, y_temp = train_test_split(
            self.images,
            self.labels,
            test_size=0.30,
            random_state=42,
            stratify=stratify,
        )

        X_valid, X_test, y_valid, y_test = train_test_split(
            X_temp,
            y_temp,
            test_size=0.50,
            random_state=42,
            stratify=y_temp if stratify is not None else None,
        )

        print("\nDataset Split")
        print("Training   :", len(X_train))
        print("Validation :", len(X_valid))
        print("Testing    :", len(X_test))

        return (
            X_train,
            X_valid,
            X_test,
            y_train,
            y_valid,
            y_test,
        )

    def save_class_mapping(self, output_path="ml/class_mapping.json"):
        with open(output_path, "w") as file:
            json.dump(self.class_mapping, file, indent=4)

        print("\nClass Mapping Saved")

    def save_dataset_statistics(self, output_path="ml/dataset_stats.json"):
        with open(output_path, "w") as file:
            json.dump(self.dataset_stats, file, indent=4)

        print("\nDataset Statistics Saved")


if __name__ == "__main__":
    DATASET_PATH = os.environ.get("TEXTILE_DATASET_PATH") or "data/tips"
    if not os.path.isdir(DATASET_PATH) and os.path.isdir("data/TFD"):
        DATASET_PATH = "data/TFD"

    processor = TextileDatasetPreprocessor(DATASET_PATH)
    processor.load_images()
    processor.split_dataset()
    processor.save_class_mapping()
    processor.save_dataset_statistics()