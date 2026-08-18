from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/datasets", tags=["Textile Datasets"])

@router.get("", response_model=List[Dict[str, Any]])
def get_integrated_datasets(current_user: User = Depends(get_current_user)):
    """
    Returns metadata for integrated textile waste datasets (Milestone 1 placeholders).
    """
    return [
        {
            "id": "textilenet",
            "name": "TextileNet (Hugging Face)",
            "purpose": "Deep Fiber Taxonomy & Fine-Grained Material Identification",
            "size": "760,949 Images",
            "classes": ["33 Fiber Taxonomies", "27 Fabric Structural Weaves", "PET Polyester", "Organic Cotton", "Flax Linen", "Silk", "Wool", "Polyamide Nylon"],
            "status": "Active (760K Model Feature Centroids Loaded)",
            "description": "Comprehensive open-access fiber dataset from Hugging Face containing 760K+ high-resolution textile microscopic patch images for state-of-the-art material recognition."
        },
        {
            "id": "aitex_industrial",
            "name": "AITEX Industrial Fabric Database",
            "purpose": "Industrial Weave Inspection & Micro-Surface Analysis",
            "size": "12,000+ Annotated Scans",
            "classes": ["Synthetic Filament", "Natural Woven", "Twill", "Satin", "Knit", "Broken Yarn", "Stain Anomaly"],
            "status": "Active (Descriptor Model Integrated)",
            "description": "Industrial textile inspection database containing high-definition macro surfaces used to differentiate smooth synthetic polyester filaments from coarse natural bast fibers."
        },
        {
            "id": "dtd_textures",
            "name": "Describable Textures Dataset (DTD)",
            "purpose": "Micro-Pattern & Perceptual Surface Analysis",
            "size": "5,640 Texture Samples",
            "classes": ["Woven", "Grid", "Chequered", "Fibrous", "Smooth", "Knitted"],
            "status": "Active (Feature Vectors Mapped)",
            "description": "Standard visual benchmark providing fine-grained perceptual texture features for patch-based material recognition."
        },
        {
            "id": "tips",
            "name": "TIPS (Textile Image Dataset)",
            "purpose": "Fabric texture classification & material recognition",
            "size": "15,000+ Images",
            "classes": ["Cotton", "Polyester", "Wool", "Nylon", "Silk", "Linen", "Acrylic", "Blend"],
            "status": "Linked (Metadata Integrated)",
            "description": "High-resolution textile scans showing structural weaves under different lighting angles to identify fabric types automatically."
        },
        {
            "id": "deepfashion",
            "name": "DeepFashion Dataset",
            "purpose": "Garment recognition & category classification",
            "size": "800,000+ Images",
            "classes": ["Tops", "Dresses", "Skirts", "Pants", "Outerwear", "Activewear"],
            "status": "Linked (Metadata Integrated)",
            "description": "Large-scale clothes database containing rich clothing category labels, landmarker attributes, and consumer-to-shop camera angles."
        },
        {
            "id": "fashion_mnist",
            "name": "Fashion-MNIST",
            "purpose": "Clothing classification baseline",
            "size": "70,000 Grayscale Images",
            "classes": ["T-shirt/top", "Trouser", "Pullover", "Dress", "Coat", "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"],
            "status": "Ready (Baseline Set)",
            "description": "Standard benchmark dataset representing garment silhouettes, used to validate initial machine learning classification accuracy."
        },
        {
            "id": "kaggle_fabric",
            "name": "Fabric Image Dataset (Kaggle)",
            "purpose": "Fabric texture recognition & damage detection",
            "size": "5,000 Images",
            "classes": ["Clean", "Stained", "Torn", "Frayed", "Mildewed"],
            "status": "Linked (Metadata Integrated)",
            "description": "Surface level pictures of textiles showcasing physical damages and cosmetic defects, crucial for quality sorting algorithms."
        },
        {
            "id": "wfdd_structural",
            "name": "Woven Fabric Defect & Structural Dataset (WFDD)",
            "purpose": "Warp & Weft Density Inspection and Thread Analysis",
            "size": "4,101 High-Res Images",
            "classes": ["Plain Weave", "Twill", "Satin", "Block Defects", "Point Anomalies", "Line Fractures"],
            "status": "Active (Pixel-Level Annotations Mapped)",
            "description": "High-definition structural dataset with micro-pixel annotations mapping thread count, warp density, and weave alignment across industrial textiles."
        },
        {
            "id": "simtho_industrial",
            "name": "Industrial Textile Anomaly Dataset (SimTho / Hugging Face)",
            "purpose": "Unsupervised Microscopic Yarn Differentiation & Defect Isolation",
            "size": "18,500 Texture Patches",
            "classes": ["Synthetic Filament", "Cellulosic Fibers", "Animal Hair Fibers", "Oil Contamination", "Thermal Damage"],
            "status": "Active (Model Weights Loaded)",
            "description": "Hugging Face dataset structured for MVTec-style unsupervised visual anomaly detection and synthetic micro-filament identification."
        },
        {
            "id": "tfd_ten_fabrics",
            "name": "Ten Fabrics Dataset (TFD)",
            "purpose": "Commercial Fabric Category & Blend Classification",
            "size": "10,000 Macro Scans",
            "classes": ["Polyester", "Cotton", "Silk", "Denim", "Wool", "Linen", "Nylon", "Rayon", "Spandex", "Viscose"],
            "status": "Active (Feature Vectors Mapped)",
            "description": "Comprehensive macro surface dataset capturing 10 fundamental commercial textile weaves under varied lighting angles and fabric tension."
        },
        {
            "id": "sustainable_fashion",
            "name": "Sustainable Fashion Dataset",
            "purpose": "Waste categorization & circularity scoring",
            "size": "12,500 Records",
            "classes": ["Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable", "Hazardous"],
            "status": "Integrated (Database Seeded)",
            "description": "Database detailing post-recyclability outcomes, lifecycle evaluations, and mechanical/chemical processing requirements for textiles."
        }
    ]
