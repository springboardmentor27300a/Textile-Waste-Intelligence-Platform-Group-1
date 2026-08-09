"""
Script to automatically extract, clean, and organize downloaded datasets 
for the AI Textile Waste Intelligence Platform.

Usage:
  1. Download Kaggle datasets as ZIP files into the `backend/datasets/` folder.
  2. Run this script: `python organize_datasets.py`
  3. It will extract files, map them to the 10 target classes, remove duplicates/corrupted images, and print a summary.
"""

import os
import zipfile
import shutil
import hashlib
from pathlib import Path

try:
    from PIL import Image, UnidentifiedImageError
except ImportError:
    print("Please install Pillow to check for corrupted images: pip install Pillow")
    exit(1)

BASE_DIR = Path(__file__).parent / "datasets"

TARGET_CLASSES = [
    "Cotton", "Polyester", "Wool", "Silk", "Linen", 
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"
]

def compute_md5(file_path):
    """Compute the MD5 hash of a file for duplicate detection."""
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def is_valid_image(file_path):
    """Check if the image is valid and not corrupted."""
    try:
        with Image.open(file_path) as img:
            img.verify()  # verify that it is, in fact, an image
        return True
    except (IOError, UnidentifiedImageError, SyntaxError):
        return False

def extract_zip_files():
    """Extract any ZIP files found in the datasets directory."""
    print("Checking for ZIP files to extract...")
    for item in BASE_DIR.glob("*.zip"):
        print(f"Extracting {item.name}...")
        try:
            with zipfile.ZipFile(item, 'r') as zip_ref:
                # Extract into a folder named after the zip file (minus extension)
                extract_dir = BASE_DIR / item.stem
                extract_dir.mkdir(exist_ok=True)
                zip_ref.extractall(extract_dir)
            print(f"Successfully extracted {item.name}")
            # Optionally remove zip file after extraction
            # item.unlink()
        except zipfile.BadZipFile:
            print(f"Error: {item.name} is a bad or corrupted zip file.")

def organize_and_clean():
    """
    Scan all extracted folders. Map images into the standardized TARGET_CLASSES
    folders. Remove duplicates and corrupted images.
    """
    print("\nOrganizing and cleaning dataset images...")
    
    # Create the unified target directory structure
    unified_dir = BASE_DIR / "unified_textile_dataset"
    for cls in TARGET_CLASSES:
        (unified_dir / cls).mkdir(parents=True, exist_ok=True)
    
    seen_hashes = set()
    processed_count = 0
    corrupted_count = 0
    duplicate_count = 0
    copied_count = 0

    # Go through all files in the datasets folder (except the unified folder itself)
    for root, _, files in os.walk(BASE_DIR):
        root_path = Path(root)
        if "unified_textile_dataset" in root_path.parts:
            continue
            
        for file in files:
            file_path = root_path / file
            
            # Simple extension check
            if file_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.webp']:
                continue
                
            processed_count += 1
            
            # 1. Check for corruption
            if not is_valid_image(file_path):
                corrupted_count += 1
                continue
                
            # 2. Check for exact duplicates
            file_hash = compute_md5(file_path)
            if not file_hash or file_hash in seen_hashes:
                duplicate_count += 1
                continue
                
            seen_hashes.add(file_hash)
            
            # 3. Determine the target class (naively based on path or filename heuristics)
            # In a real scenario, you would map specific dataset structures to classes.
            # Here we do a keyword search on the path and filename.
            target_class = "Mixed Fabrics" # Default
            search_string = str(file_path).lower()
            
            for cls in TARGET_CLASSES:
                if cls.lower() in search_string:
                    target_class = cls
                    break
                    
            # 4. Copy to the unified directory
            dest_folder = unified_dir / target_class
            dest_path = dest_folder / f"{file_hash}{file_path.suffix.lower()}"
            
            if not dest_path.exists():
                shutil.copy2(file_path, dest_path)
                copied_count += 1

    print("\n--- Cleaning Summary ---")
    print(f"Total images scanned: {processed_count}")
    print(f"Corrupted images skipped: {corrupted_count}")
    print(f"Duplicate images skipped: {duplicate_count}")
    print(f"Total images successfully organized: {copied_count}")

def print_final_stats():
    """Print the number of images in each class folder."""
    print("\n--- Unified Dataset Distribution ---")
    unified_dir = BASE_DIR / "unified_textile_dataset"
    if not unified_dir.exists():
        print("Unified dataset directory not found.")
        return
        
    total = 0
    for cls in TARGET_CLASSES:
        cls_dir = unified_dir / cls
        count = len(list(cls_dir.glob("*.*"))) if cls_dir.exists() else 0
        total += count
        print(f"{cls.ljust(15)}: {count} images")
        
    print(f"{'Total'.ljust(15)}: {total} images")
    
if __name__ == "__main__":
    extract_zip_files()
    organize_and_clean()
    print_final_stats()
    print("\nOrganization complete! You can now use dataset_loader.py for model training.")
