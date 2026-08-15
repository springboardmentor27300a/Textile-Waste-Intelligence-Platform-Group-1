import os
import cv2
import numpy as np

DATASET_DIR = "data/textile_dataset"

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

# Distinct visual signature parameters for each textile class
CLASS_PARAMS = {
    "Cotton": {"color": (230, 225, 215), "texture_scale": 12, "noise": 15, "weave": "plain"},
    "Polyester": {"color": (190, 205, 225), "texture_scale": 6, "noise": 8, "weave": "smooth"},
    "Wool": {"color": (160, 150, 140), "texture_scale": 25, "noise": 35, "weave": "fuzzy"},
    "Silk": {"color": (240, 230, 220), "texture_scale": 4, "noise": 5, "weave": "satin"},
    "Linen": {"color": (210, 195, 170), "texture_scale": 18, "noise": 22, "weave": "slub"},
    "Denim": {"color": (90, 60, 40), "texture_scale": 15, "noise": 25, "weave": "twill"},
    "Nylon": {"color": (170, 180, 210), "texture_scale": 5, "noise": 6, "weave": "ripstop"},
    "Rayon": {"color": (220, 210, 200), "texture_scale": 8, "noise": 10, "weave": "drape"},
    "Acrylic": {"color": (180, 170, 190), "texture_scale": 20, "noise": 28, "weave": "knit"},
    "Mixed Fabrics": {"color": (150, 160, 150), "texture_scale": 16, "noise": 30, "weave": "heterogeneous"},
}


def generate_textile_texture(class_name, idx, size=(224, 224)):
    params = CLASS_PARAMS[class_name]
    base_color = np.array(params["color"], dtype=np.float32)

    # Random hue/brightness variation per sample
    color_var = np.random.uniform(-25, 25, 3)
    c = np.clip(base_color + color_var, 10, 245)

    img = np.full((size[0], size[1], 3), c, dtype=np.uint8)

    # Add weave pattern lines
    scale = params["texture_scale"]
    noise_level = params["noise"]

    h, w, _ = img.shape
    if params["weave"] == "twill":
        # Diagonal twill lines for Denim
        for i in range(-h, w, scale):
            cv2.line(img, (i, 0), (i + h, h), (c * 0.7).astype(np.uint8).tolist(), 2)
    elif params["weave"] in ["fuzzy", "knit"]:
        # Random circular yarn loops for Wool / Acrylic
        for _ in range(80):
            cx, cy = np.random.randint(0, w), np.random.randint(0, h)
            r = np.random.randint(4, scale)
            cv2.circle(img, (cx, cy), r, (c * 0.8).astype(np.uint8).tolist(), 1)
    elif params["weave"] == "slub":
        # Horizontal slub threads for Linen
        for _ in range(40):
            y = np.random.randint(0, h)
            x1 = np.random.randint(0, w // 2)
            x2 = x1 + np.random.randint(20, 80)
            cv2.line(img, (x1, y), (x2, y), (c * 0.75).astype(np.uint8).tolist(), 2)
    else:
        # Standard grid weave for Cotton / Polyester / Silk / Nylon
        for i in range(0, w, scale):
            cv2.line(img, (i, 0), (i, h), (c * 0.85).astype(np.uint8).tolist(), 1)
        for j in range(0, h, scale):
            cv2.line(img, (0, j), (w, j), (c * 0.85).astype(np.uint8).tolist(), 1)

    # Gaussian noise for micro-texture
    noise = np.random.normal(0, noise_level, (h, w, 3)).astype(np.float32)
    img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)

    return img


def create_dataset(samples_per_class=40):
    os.makedirs(DATASET_DIR, exist_ok=True)
    total = 0
    for cls_name in CLASSES:
        cls_dir = os.path.join(DATASET_DIR, cls_name)
        os.makedirs(cls_dir, exist_ok=True)

        for i in range(samples_per_class):
            img = generate_textile_texture(cls_name, i)
            file_path = os.path.join(cls_dir, f"{cls_name.lower()}_{i+1:03d}.png")
            cv2.imwrite(file_path, img)
            total += 1

    print(f"Dataset generated: {total} images across {len(CLASSES)} classes in '{DATASET_DIR}'")


if __name__ == "__main__":
    create_dataset()
