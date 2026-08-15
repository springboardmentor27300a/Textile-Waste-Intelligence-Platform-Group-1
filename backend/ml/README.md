# Textile model training guide

## Recommended datasets

For this project, the best fit is the TIPS dataset for fabric classification and textile recognition.

Other suitable options are:

- DeepFashion for garment recognition
- Fabric Image Dataset for fabric texture recognition
- Sustainable Fashion Dataset for waste and recycling support

## Suggested folder layout

A Kaggle-style TIPS dataset should be placed under:

- data/tips/ with class folders such as cotton, polyester, wool, denim, silk, etc.

The training pipeline also works with:

- data/TFD/ for the existing folder-based demo data

## Training command

From the backend folder:

```bash
python ml/train_model.py
```

To point to a different dataset location:

```bash
$env:TEXTILE_DATASET_PATH = "data/tips"
python ml/train_model.py
```

For a quick smoke test training run:

```bash
$env:TEXTILE_EPOCHS = "1"
python ml/train_model.py
```

## Notes

The project now supports a Kaggle-style folder structure directly, so once a TIPS dataset is placed under data/tips the model can be trained without changing the application code.
