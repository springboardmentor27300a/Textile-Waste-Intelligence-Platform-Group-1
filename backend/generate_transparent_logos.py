from PIL import Image

def generate_logos():
    img = Image.open('../frontend/public/logo.png')
    
    # Crop horizontal primary logo
    box = (50, 100, 580, 250)
    logo = img.crop(box)
    logo = logo.convert('RGBA')
    
    w, h = logo.size
    bg_color = (244, 246, 245)
    
    # Create Light Mode Logo (Transparent background, keep original green colors)
    logo_light = Image.new('RGBA', (w, h))
    for y in range(h):
        for x in range(w):
            r, g, b, a = logo.getpixel((x, y))
            dist = sum(abs(c1 - c2) for c1, c2 in zip((r, g, b), bg_color))
            if dist < 40:
                logo_light.putpixel((x, y), (0, 0, 0, 0))
            else:
                logo_light.putpixel((x, y), (r, g, b, 255))
                
    logo_light.save('../frontend/public/logo-light.png')
    print("Saved logo-light.png (transparent background, original colors)")
    
    # Create Dark Mode Logo (Transparent background, map dark greens/blacks to bright neon mint green / white)
    logo_dark = Image.new('RGBA', (w, h))
    for y in range(h):
        for x in range(w):
            r, g, b, a = logo.getpixel((x, y))
            dist = sum(abs(c1 - c2) for c1, c2 in zip((r, g, b), bg_color))
            if dist < 40:
                logo_dark.putpixel((x, y), (0, 0, 0, 0))
            else:
                # This is a graphic/text pixel. Check if it is a dark color (the text or dark green parts)
                # Let's check how dark it is.
                gray = (r + g + b) // 3
                if gray < 120:
                    # Map dark text/graphics to a bright neon mint green (#10B981) or light Sage green (#A5D6A7)
                    # Let's map it to #A5D6A7 (165, 214, 167)
                    logo_dark.putpixel((x, y), (165, 214, 167, 255))
                else:
                    # Keep lighter parts (they are already lighter greens, but let's make sure they are bright enough)
                    # For example, if it's mid green (50, 149, 82), let's boost it or keep it
                    logo_dark.putpixel((x, y), (r, g, b, 255))
                    
    logo_dark.save('../frontend/public/logo-dark.png')
    print("Saved logo-dark.png (transparent background, color-shifted for dark mode)")

if __name__ == '__main__':
    generate_logos()
