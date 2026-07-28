from PIL import Image

def inspect():
    img = Image.open('../frontend/public/logo.png')
    w, h = img.size
    print(f"Original image size: {w}x{h}, mode: {img.mode}")
    
    # Analyze regions
    # Let's check 4 regions: top-left, top-right, bottom-left, bottom-right
    regions = {
        "Top-Left": (0, 0, w//2, h//2),
        "Top-Right": (w//2, 0, w, h//2),
        "Bottom-Left": (0, h//2, w//2, h),
        "Bottom-Right": (w//2, h//2, w, h)
    }
    
    for name, box in regions.items():
        crop_img = img.crop(box)
        # Calculate average color
        pixels = list(crop_img.getdata())
        num_pixels = len(pixels)
        if crop_img.mode == 'RGBA':
            avg_r = sum(p[0] for p in pixels) // num_pixels
            avg_g = sum(p[1] for p in pixels) // num_pixels
            avg_b = sum(p[2] for p in pixels) // num_pixels
            avg_a = sum(p[3] for p in pixels) // num_pixels
            avg_gray = (avg_r + avg_g + avg_b) // 3
            print(f"\n--- {name} ---")
            print(f"Average RGBA: ({avg_r}, {avg_g}, {avg_b}, {avg_a})")
            print(f"Average Gray: {avg_gray}")
            print(f"Is dark background: {avg_gray < 128}")
        else:
            avg_r = sum(p[0] for p in pixels) // num_pixels
            avg_g = sum(p[1] for p in pixels) // num_pixels
            avg_b = sum(p[2] for p in pixels) // num_pixels
            avg_gray = (avg_r + avg_g + avg_b) // 3
            print(f"\n--- {name} ---")
            print(f"Average RGB: ({avg_r}, {avg_g}, {avg_b})")
            print(f"Average Gray: {avg_gray}")
            print(f"Is dark background: {avg_gray < 128}")

if __name__ == '__main__':
    inspect()
