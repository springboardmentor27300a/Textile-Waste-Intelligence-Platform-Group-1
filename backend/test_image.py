from PIL import Image

image = Image.open("test_images/towel.jpeg")

print("Format :", image.format)
print("Size   :", image.size)
print("Mode   :", image.mode)

image.show()