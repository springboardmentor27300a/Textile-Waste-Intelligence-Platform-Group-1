"""
Dataset Loader Utility for the AI Textile Waste Intelligence Platform.

This utility loads the organized, unified dataset structure created by `organize_datasets.py`.
It can be imported into your ML training notebooks (e.g., PyTorch or TensorFlow) to 
easily retrieve image paths and labels.
"""

from pathlib import Path
from typing import Dict, List, Tuple

BASE_DIR = Path(__file__).parent / "datasets" / "unified_textile_dataset"

def get_dataset_stats() -> Dict[str, int]:
    """
    Scan the unified dataset directory and return the count of images per class.
    
    Returns:
        Dict[str, int]: A dictionary mapping class names to image counts.
    """
    stats = {}
    if not BASE_DIR.exists():
        return stats

    for cls_dir in BASE_DIR.iterdir():
        if cls_dir.is_dir():
            count = len([f for f in cls_dir.iterdir() if f.is_file()])
            stats[cls_dir.name] = count
            
    return stats

def get_image_paths() -> Tuple[List[str], List[str]]:
    """
    Retrieve all valid image paths and their corresponding labels.
    
    Returns:
        Tuple[List[str], List[str]]: 
            - A list of absolute image file paths.
            - A corresponding list of class labels.
    """
    image_paths = []
    labels = []
    
    if not BASE_DIR.exists():
        print(f"Warning: Dataset directory {BASE_DIR} does not exist.")
        print("Please run organize_datasets.py first.")
        return image_paths, labels

    for cls_dir in BASE_DIR.iterdir():
        if cls_dir.is_dir():
            label = cls_dir.name
            for file_path in cls_dir.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                    image_paths.append(str(file_path.absolute()))
                    labels.append(label)
                    
    return image_paths, labels

def display_summary():
    """Print a readable summary of the available unified dataset."""
    print("========================================")
    print("      DATASET LOADER SUMMARY            ")
    print("========================================")
    
    if not BASE_DIR.exists():
        print("ERROR: Unified dataset directory not found.")
        print("Please ensure you have downloaded datasets into backend/datasets/")
        print("and run `python organize_datasets.py` first.")
        return
        
    stats = get_dataset_stats()
    
    if not stats:
        print("Directory exists, but no classes found.")
        return
        
    total_images = sum(stats.values())
    
    print(f"{'Class Name'.ljust(20)} | {'Image Count'}")
    print("-" * 40)
    for cls, count in sorted(stats.items()):
        print(f"{cls.ljust(20)} | {count}")
    print("-" * 40)
    print(f"{'TOTAL'.ljust(20)} | {total_images}")
    print("========================================")
    
    if total_images == 0:
        print("\nWarning: No images found. Did you run organize_datasets.py?")

if __name__ == "__main__":
    # If run directly, just display the summary
    display_summary()
