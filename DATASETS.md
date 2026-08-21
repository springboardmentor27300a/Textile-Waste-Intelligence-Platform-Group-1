# Datasets

The platform trains on two public datasets you download yourself. This page explains what
each one actually contains, which specification module it supports, and how to train.

---

## Read this first

**Neither dataset carries fibre labels.** Neither AITEX nor Fashion-MNIST can tell you
whether a swatch is cotton, polyester or wool, so neither can train the material
classifier. This is the single most important thing to understand before a viva, because
"I trained fibre classification on AITEX" is not true and does not survive one follow-up
question.

What they can do is train two genuinely supervised models that the specification asks for:

| Dataset | What it actually contains | Specification module it supports |
|---|---|---|
| **AITEX Fabric Image Database** | 7 fabric structures as 4096×256 greyscale strips, split defect / no-defect, with pixel masks | Module 3 — **Damage Detection**, **Contamination Detection** |
| **Fashion-MNIST** | 70,000 28×28 greyscale garment images, 10 clothing categories | Module 4 — **fabric category recognition**; spec lists it for "clothing classification, image classification baseline" |

The material classifier (Cotton, Polyester, Wool, Silk, Linen, Denim, Nylon, Rayon,
Acrylic, Mixed Fabrics) continues to train on the synthetic bootstrap corpus described in
the README. If you want it trained on real images, you need a dataset where each folder
is a *fibre* — the Kaggle "Fabric Image Dataset" by texture, or your own photographs —
and then `scripts/prepare_fabric_dataset.py` maps it.

> **Note on naming.** Several different Kaggle uploads are called "fabric image dataset".
> The one that unpacks as `Defect_images/`, `NODefect_images/` and `Mask_images/` is
> AITEX — a *defect detection* dataset, not a material dataset. That is what the folder
> layout in this project expects.

---

## Expected folder layout

Put both datasets under `backend/data/` (already in `.gitignore`):

```
backend/data/
├── Defect_images/          AITEX — 0044_019_04.png etc.
├── NODefect_images/        AITEX — per-fabric sub-folders
│   └── 2306881-210020u/
├── Mask_images/            AITEX — 0044_019_04_mask.png
├── fashion-mnist_train.csv     Fashion-MNIST (Kaggle CSV form)
├── fashion-mnist_test.csv
├── train-images-idx3-ubyte     Fashion-MNIST (official IDX form)
├── train-labels-idx1-ubyte
├── t10k-images-idx3-ubyte
└── t10k-labels-idx1-ubyte
```

Either Fashion-MNIST form works — the loader tries CSV first, then IDX (gzipped or not),
so you don't have to convert anything.

---

## 1. Check what you have

Always run this before training. It tells you whether the files are where the code
expects them:

```bash
cd backend
python scripts/train_on_datasets.py inspect --aitex data --fashion data
```

```
AITEX Fabric Image Database
  Defect images    : 105
  No-defect images : 140
  Masks            : 105
  Fabric codes     : 00, 01, 02, 03, 04, 05, 06

Fashion-MNIST train: shape (28, 28), labels seen [0, 1, 2, ...]
```

If masks come back as 0, the patch labels fall back to a weaker whole-image label and the
script warns you.

---

## 2. Train the defect detector (AITEX)

```bash
python scripts/train_on_datasets.py defect --aitex data --limit-clean 1500
```

**What happens.** AITEX strips are 4096×256 — far too wide to classify whole. The loader
cuts each into 256×256 patches and labels every patch from its mask: a patch counts as
defective when the mask marks more than 0.15% of its pixels. Clean patches vastly
outnumber defective ones, so `--limit-clean` thins them to keep the classes balanced.

**The split is grouped by source image.** Patches cut from the same strip are near
duplicates, so a random split would put near-identical patches in both train and test and
report a flattering, meaningless score. `GroupShuffleSplit` on the source filename
prevents that. Expect a realistic AUC in the 0.80–0.95 range on real AITEX; if you see
1.00, something is leaking.

This is the only fully supervised computer-vision model in the platform — the labels come
from human-drawn pixel masks, not from a rule.

**Where it shows up.** Once trained, the defect probability is fused with the heuristic
damage score (50/50) inside `analyse_image`, so it changes the damage figure, which feeds
material quality, which feeds the waste class and circularity score. It appears in the UI
as "Defect detection" on the Image Analysis and batch detail screens.

---

## 3. Train the garment classifier (Fashion-MNIST)

```bash
python scripts/train_on_datasets.py garment --fashion data --limit 20000
```

Drop `--limit` to use all 60,000 rows; expect around 88% test accuracy with the full set,
and a couple of minutes of training. `HistGradientBoostingClassifier` on raw pixels is
used rather than a CNN, for the same reason as everywhere else in this project: it trains
on a laptop CPU in minutes and is easy to explain.

**How the prediction is used.** A garment category is not a fibre, so it is never
presented as one. It is used two ways:

1. As the item type — "Trouser", "Coat", "Bag".
2. As a soft prior over fibres that garment is usually made from (Trouser → Denim,
   Cotton, Polyester), shown as suggestion chips, never overriding the classifier.

**Honest limitation, stated in the UI.** Fashion-MNIST is 28×28 white-on-black
silhouettes of whole garments. The predictor inverts and downsamples the input to match,
but it reads *whole-garment photographs against a plain background*, not close-up weave
shots. On a macro fabric photo its output is not meaningful. The caveat is displayed
beneath the prediction so nobody misreads it.

---

## 4. Train everything

```bash
python scripts/train_on_datasets.py all --aitex data --fashion data
python -m app.ml.train                     # material + waste models
```

Then restart the API, or as an administrator `POST /api/models/reload`.

Both dataset models are **optional**. If they haven't been trained the platform runs
exactly as before — the heuristic damage score is used and the garment block is omitted.
Nothing shows empty scaffolding.

---

## 5. Confirm it worked

- **Admin screen** → "Dataset-backed models" shows each model as Trained or Not trained,
  with its holdout metrics and, if untrained, the exact command to train it.
- **API** → `GET /api/models/datasets`
- **Image Analysis** → upload an image; a "Dataset-backed findings" card appears.

---

## Measured results on the real datasets

Both datasets have now been downloaded, extracted and trained on. These are the actual
numbers, not projections.

### AITEX defect detection

| Metric | Value |
|---|---|
| Source images | 246 (106 defect, 141 no-defect) |
| Training patches | 2,238 (238 defective) at 128px |
| Fabric structures | 7 (codes 00–06) |
| Holdout ROC-AUC | **0.928** |
| Average precision | 0.535 |
| Recall / precision at operating threshold | 0.53 / 0.49 |

The model ranks defects well (AUC 0.93) but is a *triage* tool, not an inspector: at the
recall-targeting threshold it catches about half of defective patches. Say that plainly if
asked. Hand-crafted global features on 128px patches are the limit here; a segmentation
CNN trained on the masks is the route to a materially better number.

### Fashion-MNIST garment recognition

| Metric | Value |
|---|---|
| Train / test | 60,000 / 10,000 |
| Test accuracy | **87.75%** |
| Strongest classes | Trouser (F1 0.98), Sandal (0.94), Bag (0.94) |
| Weakest class | Shirt (F1 0.70) |

Shirt is the known hard class — it is routinely confused with T-shirt, Pullover and Coat.

**Quote 87.75% as dataset benchmark accuracy, never as platform accuracy.** On upscaled
garment photographs the same model scores about 64%, and on a fabric close-up it is not
applicable at all.

---

## Four bugs the real data exposed

Worth knowing, because each is a plausible viva question and each was invisible against
mock data.

1. **Two images ship split masks.** `0044_019_04` and `0097_030_03` have `_mask1.png` and
   `_mask2.png` rather than `_mask.png`. Matching only the singular name silently
   mislabelled every defect patch in those images as clean. The loader now merges all
   masks for an image.

2. **One defect image has no mask at all** (`0100_025_08.png`, the only fabric code 08).
   It is reported by `inspect` and skipped by training rather than guessed at.

3. **The strips are padded with flat white.** 1,494 patches — 10% of the clean class —
   were pure 255 padding, not fabric. Trivially separable filler that taught the model
   nothing. Excluding it lifted recall from 0.48 to 0.53.

4. **The garment applicability guard was defeated by cropping.** Bounding-box cropping was
   added to fix a framing mismatch (accuracy on garment photos went from 33% to 68%), but
   cropping manufactures empty margin, so every AITEX patch came back a confident
   "Dress, 63%". Applicability is now judged on the uncropped image using two conditions —
   a uniform border ring *and* contrast between border and centre. Verified: fabric
   close-ups declined 6/6, demo swatches declined 5/5, garment photos accepted 39/40.

---

## What is verified, and what isn't

Verified against the real data: both loaders, mask merging, patch extraction and labelling,
blank-padding rejection, grouped splitting, both Fashion-MNIST file formats, training,
persistence, the API and the UI rendering. Fourteen automated tests cover the pipeline,
including regressions for the multi-mask and applicability-guard bugs above.

Not verified: performance on photographs taken in your own facility. Everything here is
measured on AITEX's flat, evenly lit strips and Fashion-MNIST's silhouettes. Real
warehouse photographs are a harder problem than either.
