"""
Trains a real scikit-learn image classifier on Fashion-MNIST (idx3-ubyte
format) to prove the train -> evaluate -> save pipeline genuinely works
end-to-end on real data.

IMPORTANT CAVEAT, stated directly: Fashion-MNIST's labels are clothing
SILHOUETTES (T-shirt, Trouser, Coat, Sandal, ...), not fibre/material
types. No dataset sourced for this project has fibre-type labels ready to
train on, so this is a demonstration of the pipeline's mechanics with real
data and a real, reportable accuracy number - not a material classifier.
Swap in a fibre-labelled dataset later (same code shape) to make it one.

Usage:
    python scripts/train_image_classifier_demo.py ./data/raw/fashion-mnist/data/fashion
"""
import gzip
import os
import struct
import sys
import time

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

LABELS = ["T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
          "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"]


def load_idx_images(path):
    with gzip.open(path, "rb") as f:
        _, count, rows, cols = struct.unpack(">IIII", f.read(16))
        data = np.frombuffer(f.read(), dtype=np.uint8).reshape(count, rows * cols)
    return data


def load_idx_labels(path):
    with gzip.open(path, "rb") as f:
        _, count = struct.unpack(">II", f.read(8))
        return np.frombuffer(f.read(), dtype=np.uint8)


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    data_dir = sys.argv[1]
    print(f"Loading Fashion-MNIST from {data_dir} ...")

    X_train = load_idx_images(os.path.join(data_dir, "train-images-idx3-ubyte.gz"))
    y_train = load_idx_labels(os.path.join(data_dir, "train-labels-idx1-ubyte.gz"))
    X_test = load_idx_images(os.path.join(data_dir, "t10k-images-idx3-ubyte.gz"))
    y_test = load_idx_labels(os.path.join(data_dir, "t10k-labels-idx1-ubyte.gz"))

    print(f"Loaded {len(X_train)} real training images and {len(X_test)} real held-out test images.")

    X_train = X_train.astype(np.float32) / 255.0
    X_test = X_test.astype(np.float32) / 255.0

    print("Training a RandomForestClassifier on real pixel data (this takes a couple of minutes)...")
    start = time.time()
    clf = RandomForestClassifier(n_estimators=100, max_depth=20, n_jobs=-1, random_state=42)
    clf.fit(X_train, y_train)
    elapsed = time.time() - start
    print(f"Training finished in {elapsed:.1f}s")

    preds = clf.predict(X_test)
    accuracy = accuracy_score(y_test, preds)

    print()
    print(f"REAL TEST ACCURACY: {accuracy * 100:.2f}%")
    print(f"(evaluated on {len(y_test)} real held-out test images the model never saw during training)")
    print()
    print("Caveat: these labels are clothing silhouettes, not fibre/material types - see the module docstring.")

    out_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "app", "ml_models")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "fashion_mnist_demo_classifier.joblib")
    joblib.dump({"model": clf, "labels": LABELS, "accuracy": accuracy}, out_path)
    print(f"Saved trained model to {out_path}")


if __name__ == "__main__":
    main()
