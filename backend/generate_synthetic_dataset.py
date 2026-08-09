import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

BASE_DIR = Path(__file__).parent / "datasets" / "unified_textile_dataset"

TARGET_CLASSES = [
    "Cotton", "Polyester", "Wool", "Silk", "Linen", 
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"
]

def generate_texture(base_color, variance=20, width=224, height=224, texture_type="smooth"):
    # Generate base noise
    noise = np.random.randint(-variance, variance, (height, width, 3), dtype=np.int16)
    
    # Base color array
    base = np.array(base_color, dtype=np.int16)
    
    # Add noise
    img_arr = np.clip(base + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(img_arr, 'RGB')
    
    if texture_type == "denim":
        # Add diagonal twill lines
        draw = ImageDraw.Draw(img)
        for i in range(-width, width, 4):
            draw.line([(i, 0), (i + height, height)], fill=(255, 255, 255, 30), width=1)
        img = img.filter(ImageFilter.SMOOTH)
    elif texture_type == "wool":
        # Add blur and noise for fuzzy texture
        img = img.filter(ImageFilter.GaussianBlur(1))
        noise = np.random.randint(-40, 40, (height, width, 3), dtype=np.int16)
        img_arr = np.clip(np.array(img, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(img_arr, 'RGB')
    elif texture_type == "silk":
        # Add horizontal gradient for sheen
        for y in range(height):
            sheen = int(40 * np.sin(y / 20.0))
            row = np.array(img_arr[y, :, :], dtype=np.int16)
            img_arr[y, :, :] = np.clip(row + sheen, 0, 255).astype(np.uint8)
        img = Image.fromarray(img_arr, 'RGB').filter(ImageFilter.SMOOTH)
    elif texture_type == "linen":
        # Add irregular cross-hatching
        draw = ImageDraw.Draw(img)
        for _ in range(200):
            x = random.randint(0, width)
            y = random.randint(0, height)
            draw.line([(x, y), (x + random.randint(10, 50), y)], fill=(0, 0, 0, 20), width=1)
            draw.line([(x, y), (x, y + random.randint(10, 50))], fill=(0, 0, 0, 20), width=1)
    
    return img

CLASS_PROPERTIES = {
    "Cotton": {"colors": [(240, 240, 240), (200, 220, 240)], "texture": "smooth"},
    "Polyester": {"colors": [(100, 100, 150), (150, 100, 100)], "texture": "smooth"},
    "Wool": {"colors": [(120, 100, 80), (180, 170, 160)], "texture": "wool"},
    "Silk": {"colors": [(250, 230, 200), (220, 200, 250)], "texture": "silk"},
    "Linen": {"colors": [(210, 200, 180), (190, 180, 160)], "texture": "linen"},
    "Denim": {"colors": [(40, 60, 120), (30, 50, 100)], "texture": "denim"},
    "Nylon": {"colors": [(50, 200, 100), (200, 200, 50)], "texture": "smooth"},
    "Rayon": {"colors": [(200, 50, 100), (50, 100, 200)], "texture": "silk"},
    "Acrylic": {"colors": [(220, 100, 50), (100, 220, 220)], "texture": "wool"},
    "Mixed Fabrics": {"colors": [(150, 150, 150), (100, 150, 100)], "texture": "linen"},
}

def generate_dataset(images_per_class=30):
    print("Generating synthetic textile images for training...")
    for cls in TARGET_CLASSES:
        cls_dir = BASE_DIR / cls
        cls_dir.mkdir(parents=True, exist_ok=True)
        
        props = CLASS_PROPERTIES.get(cls, {"colors": [(200, 200, 200)], "texture": "smooth"})
        
        for i in range(images_per_class):
            base_color = random.choice(props["colors"])
            # Add random color drift
            drift = np.random.randint(-20, 20, 3)
            current_color = np.clip(np.array(base_color) + drift, 0, 255)
            
            img = generate_texture(current_color, texture_type=props["texture"])
            img.save(cls_dir / f"synth_{i}.jpg")
            
        print(f"Generated {images_per_class} images for {cls}")
    
    print("\nDataset generation complete!")

if __name__ == "__main__":
    generate_dataset()
