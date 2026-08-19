import torch
from torchvision import datasets, transforms

# This will automatically download Fashion-MNIST into a './data' folder
train_dataset = datasets.FashionMNIST(
    root='./data', train=True, download=True, transform=transforms.ToTensor()
)

test_dataset = datasets.FashionMNIST(
    root='./data', train=False, download=True, transform=transforms.ToTensor()
)

print('Fashion-MNIST dataset downloaded and loaded successfully for PyTorch!')