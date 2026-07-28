from PIL import Image

def crop_logo():
    img = Image.open('../frontend/public/logo.png')
    
    # We crop the horizontal primary logo on the top-left
    # Box coordinates: (left, upper, right, lower)
    # The image is 1024 x 558. Let's crop from x=50 to x=580, and y=100 to y=250.
    box = (50, 100, 580, 250)
    logo = img.crop(box)
    
    # Save the cropped logo
    logo.save('../frontend/public/logo-cropped.png')
    print("Logo cropped and saved successfully as logo-cropped.png")

if __name__ == '__main__':
    crop_logo()
