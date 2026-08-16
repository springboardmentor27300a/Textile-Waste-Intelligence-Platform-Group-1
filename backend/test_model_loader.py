from app.material_classifier import model_loader

model = model_loader.model
classes = model_loader.class_names

print("Model Type:", type(model))
print("Total Classes:", len(classes))
print("First 5 Classes:", classes[:5])