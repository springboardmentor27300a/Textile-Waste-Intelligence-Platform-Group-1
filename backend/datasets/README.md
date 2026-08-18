# Textile Waste Intelligence Platform - Integrated Datasets

This directory contains the taxonomy definitions, metadata descriptors, and model feature configuration files for the integrated textile waste datasets used by the platform's AI classification and circular economy matching engines.

## 📊 Integrated Datasets Overview

1. **TextileNet (Hugging Face)** (`textile_net.json`)
   - **Size**: 760,949 Images
   - **Scope**: 33 Fiber Taxonomies & 27 Fabric Structural Weaves (Polyester, Organic Cotton, Flax Linen, Silk, Wool, Nylon, Blends)
   - **Usage**: Primary spatial feature centroids for microscopic fiber pattern identification.

2. **AITEX Industrial Fabric Database** (`aitex_industrial.json`)
   - **Size**: 12,000+ High-Definition Scans
   - **Scope**: Industrial filament surfaces, weave structures, and surface defect anomalies.
   - **Usage**: Surface texture descriptors distinguishing smooth synthetic filaments from coarse natural bast fibers.

3. **Describable Textures Dataset (DTD)** (`dtd_textures.json`)
   - **Size**: 5,640 Micro-Pattern Texture Vectors
   - **Scope**: Perceptual texture attributes (woven, grid, fibrous, knitted, chequered).
   - **Usage**: Micro-pattern extraction for CNN feature extraction and Grad-CAM spatial heatmaps.

4. **TIPS Textile Image Dataset** (`tips_fabric.json`)
   - **Size**: 15,000+ Scans
   - **Scope**: Structural weave identification under multi-angle industrial illumination.
