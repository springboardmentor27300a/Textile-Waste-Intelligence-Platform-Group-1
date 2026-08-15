"""
Milestone 1 — Textile dataset integration stub.

This script documents and prepares the recommended datasets referenced in the
project plan so they can be wired into the Material Classification Engine in
Milestone 2. For Milestone 1, it just registers dataset metadata and creates
placeholder folders — no training happens yet.

Recommended datasets:
  1. TIPS (Textile Image Dataset)        -> fabric classification, textile recognition
  2. DeepFashion Dataset                  -> garment recognition, fabric category classification
  3. Fashion-MNIST                        -> clothing classification baseline
  4. Fabric Image Dataset (Kaggle)        -> fabric texture recognition, material classification
  5. Sustainable Fashion Dataset          -> waste categorization, recycling recommendation support

Usage:
    python dataset_integration.py
"""
import os
import json

DATASETS = [
    {
        "name": "TIPS (Textile Image Dataset)",
        "purpose": ["fabric_classification", "textile_recognition"],
        "folder": "tips",
    },
    {
        "name": "DeepFashion Dataset",
        "purpose": ["garment_recognition", "fabric_category_classification"],
        "folder": "deepfashion",
    },
    {
        "name": "Fashion-MNIST",
        "purpose": ["clothing_classification", "image_classification_baseline"],
        "folder": "fashion_mnist",
    },
    {
        "name": "Fabric Image Dataset (Kaggle)",
        "purpose": ["fabric_texture_recognition", "material_classification"],
        "folder": "fabric_image_kaggle",
    },
    {
        "name": "Sustainable Fashion Dataset",
        "purpose": ["waste_categorization", "recycling_recommendation_support"],
        "folder": "sustainable_fashion",
    },
]


def register_datasets(base_dir: str = "./datasets") -> dict:
    os.makedirs(base_dir, exist_ok=True)
    manifest = {"datasets": []}

    for ds in DATASETS:
        folder_path = os.path.join(base_dir, ds["folder"])
        os.makedirs(folder_path, exist_ok=True)
        # Placeholder README so contributors know what goes here
        readme_path = os.path.join(folder_path, "README.md")
        if not os.path.exists(readme_path):
            with open(readme_path, "w") as f:
                f.write(f"# {ds['name']}\n\nPurpose: {', '.join(ds['purpose'])}\n\n"
                         f"Download the dataset and place raw files in this folder.\n")

        manifest["datasets"].append({**ds, "local_path": folder_path, "status": "registered"})

    manifest_path = os.path.join(base_dir, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest


if __name__ == "__main__":
    result = register_datasets()
    print(f"Registered {len(result['datasets'])} datasets. Manifest written to ./datasets/manifest.json")
