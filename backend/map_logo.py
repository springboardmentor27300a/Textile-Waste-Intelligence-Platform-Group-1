from PIL import Image

def map_content():
    img = Image.open('../frontend/public/logo.png')
    w, h = img.size
    print(f"Image size: {w}x{h}")
    
    # We will divide the image into 20 columns and 15 rows
    cols = 20
    rows = 15
    cell_w = w / cols
    cell_h = h / rows
    
    bg_color = (244, 246, 245)
    
    # Load pixels
    pixels = img.convert('RGB')
    
    print("\nContent map (X = content, . = background):")
    for r in range(rows):
        row_str = ""
        for c in range(cols):
            # Check pixels in this cell
            has_content = False
            start_x = int(c * cell_w)
            end_x = int((c+1) * cell_w)
            start_y = int(r * cell_h)
            end_y = int((r+1) * cell_h)
            
            for y in range(start_y, end_y, 2):
                for x in range(start_x, end_x, 2):
                    pixel = pixels.getpixel((x, y))
                    dist = sum(abs(c1 - c2) for c1, c2 in zip(pixel, bg_color))
                    if dist > 40:
                        has_content = True
                        break
                if has_content:
                    break
            
            row_str += "X" if has_content else "."
        print(row_str)

if __name__ == '__main__':
    map_content()
