"""
Milestone 2: Material Recognition & Waste Classification

This package holds the image-analysis pipeline:

  feature_extraction.py  -> turns an uploaded textile image into a compact
                            numeric feature vector (color + texture + pattern)
                            using only PIL/NumPy (no heavy CV/DL dependency).

  material_classifier.py -> Material Classification Engine. Nearest-centroid
                            classifier (same baseline strategy as the
                            Milestone 1 Fashion-MNIST demo) over 10 textile
                            material classes, plus fiber-blend and quality
                            estimation.

  waste_classifier.py    -> Textile Waste Classification Engine. Combines the
                            material prediction with damage/contamination
                            signals to produce a waste category, recyclability
                            score, and a recycling-route recommendation.

As with the Milestone 1 classifier, these are transparent, rule-based /
nearest-centroid baselines built from domain-informed reference profiles
(no labeled material-image dataset was available for this milestone). The
API contract here is written so a trained CNN (e.g. fine-tuned on a fabric
dataset such as TIPS or a custom-labeled set) could be dropped in later
without changing the routes or frontend.
"""
