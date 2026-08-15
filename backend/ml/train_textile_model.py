import os
import json
import joblib
import cv2
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

DATASET_DIR = "data/textile_dataset"
MODEL_PATH = "ml/model.pkl"
CLASS_MAPPING_PATH = "ml/class_mapping.json"
EVALUATION_PATH = "ml/evaluation.json"
DATASET_STATS_PATH = "ml/dataset_stats.json"

CLASSES = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Denim",
    "Nylon",
    "Rayon",
    "Acrylic",
    "Mixed Fabrics",
]


def extract_features(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(img_rgb, (128, 128))

    # 1. Color histogram features (RGB)
    hist_r = cv2.calcHist([resized], [0], None, [16], [0, 256]).flatten()
    hist_g = cv2.calcHist([resized], [1], None, [16], [0, 256]).flatten()
    hist_b = cv2.calcHist([resized], [2], None, [16], [0, 256]).flatten()
    color_hist = np.concatenate([hist_r, hist_g, hist_b])
    color_hist /= (np.sum(color_hist) + 1e-6)

    # 2. Brightness & contrast statistics
    mean_val = np.mean(img_gray)
    std_val = np.std(img_gray)
    skew_val = np.mean((img_gray - mean_val) ** 3) / (std_val ** 3 + 1e-6)

    # 3. Edge density & texture features (Canny & Sobel)
    edges = cv2.Canny(img_gray, 50, 150)
    edge_density = np.count_nonzero(edges) / float(edges.size)

    sobelx = cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(img_gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.mean(np.sqrt(sobelx**2 + sobely**2))

    # Combine features into a single feature vector
    features = np.hstack([color_hist, [mean_val, std_val, skew_val, edge_density, grad_mag]])
    return features


def train_model():
    print("Extracting features from textile dataset...")
    X, y = [], []
    class_mapping = {i: cls_name for i, cls_name in enumerate(CLASSES)}

    for cls_idx, cls_name in enumerate(CLASSES):
        cls_dir = os.path.join(DATASET_DIR, cls_name)
        if not os.path.isdir(cls_dir):
            continue

        for f in os.listdir(cls_dir):
            if f.endswith((".png", ".jpg", ".jpeg")):
                feat = extract_features(os.path.join(cls_dir, f))
                if feat is not None:
                    X.append(feat)
                    y.append(cls_idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int64)

    print(f"Total samples: {len(X)} across {len(np.unique(y))} classes")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = ExtraTreesClassifier(n_estimators=100, max_depth=15, random_state=42)
    clf.fit(X_train, y_train)

    train_acc = clf.score(X_train, y_train) * 100
    test_acc = clf.score(X_test, y_test) * 100

    print(f"\nModel Training Complete!")
    print(f"Train Accuracy: {train_acc:.2f}%")
    print(f"Test Accuracy : {test_acc:.2f}%")

    os.makedirs("ml", exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

    with open(CLASS_MAPPING_PATH, "w") as f:
        json.dump({str(k): v for k, v in class_mapping.items()}, f, indent=4)
    print(f"Saved class mapping to {CLASS_MAPPING_PATH}")

    y_pred = clf.predict(X_test)
    report = classification_report(y_test, y_pred, target_names=CLASSES, output_dict=True, zero_division=0)
    conf_matrix = confusion_matrix(y_test, y_pred).tolist()

    evaluation = {
        "test_accuracy": round(float(test_acc), 2),
        "train_accuracy": round(float(train_acc), 2),
        "classification_report": report,
        "confusion_matrix": conf_matrix,
    }
    with open(EVALUATION_PATH, "w") as f:
        json.dump(evaluation, f, indent=4)

    stats = {
        "total_images": len(X),
        "classes": len(CLASSES),
        "supported_materials": CLASSES,
        "test_accuracy": round(float(test_acc), 2),
    }
    with open(DATASET_STATS_PATH, "w") as f:
        json.dump(stats, f, indent=4)


if __name__ == "__main__":
    train_model()
