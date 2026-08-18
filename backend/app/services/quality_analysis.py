import cv2
import numpy as np
from sklearn.cluster import KMeans
from skimage.feature import graycomatrix, graycoprops
from skimage.measure import shannon_entropy

class QualityAnalyzer:

    def __init__(self):
        pass

    def get_color_name(self, rgb):
        r, g, b = rgb

        if r > 170 and g > 170 and b < 140:
            return "Yellow"

        elif r > 200 and g > 200 and b > 200:
            return "White"

        elif r < 60 and g < 60 and b < 60:
            return "Black"

        # elif r > 170 and g > 170 and b < 140:
        #     return "Yellow"

        elif r > 180 and g < 120 and b < 120:
            return "Red"

        elif r < 120 and g > 180 and b < 120:
            return "Green"

        elif b > r and b > g:
            return "Blue"

        elif r > 150 and g > 120 and b < 100:
            return "Brown"

        elif r > 150 and g > 150 and b > 150:
            return "Gray"

        else:
            return "Unknown"

    def analyze(self, image_path):

        image = cv2.imread(image_path)

        if image is None:
            raise Exception("Unable to load image.")

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # ----------------------------
        # Remove White Background
        # ----------------------------

        mask = np.any(rgb < 245, axis=2)

        cloth_pixels = rgb[mask]

        if len(cloth_pixels) < 100:
            cloth_pixels = rgb.reshape((-1, 3))

        gray_pixels = gray[mask]

        if len(gray_pixels) == 0:
            gray_pixels = gray.flatten()

        # Image dimensions
        height, width = rgb.shape[:2]

        # Brightness
        brightness = float(np.mean(gray_pixels))

        # Contrast
        contrast = float(np.std(gray_pixels))

        # Sharpness (Variance of Laplacian)
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # Edge Detection
        edges = cv2.Canny(gray, 100, 200)

        # Edge Density
        edge_density = np.count_nonzero(edges) / edges.size

        # ----------------------------
        # Dominant Color
        # ----------------------------

        kmeans = KMeans(
            n_clusters=3,
            random_state=42,
            n_init=10
        )

        kmeans.fit(cloth_pixels)

        colors = kmeans.cluster_centers_
        labels = kmeans.labels_

        counts = np.bincount(labels)

        dominant_color = colors[np.argmax(counts)]
        dominant_color = tuple(int(c) for c in dominant_color)
        color_name = self.get_color_name(dominant_color)

        # ----------------------------
        # Texture Features (GLCM)
        # ----------------------------

        glcm = graycomatrix(
            gray,
            distances=[1],
            angles=[0],
            levels=256,
            symmetric=True,
            normed=True
        )

        texture_contrast = graycoprops(glcm, "contrast")[0, 0]
        texture_energy = graycoprops(glcm, "energy")[0, 0]
        texture_homogeneity = graycoprops(glcm, "homogeneity")[0, 0]

        entropy = shannon_entropy(gray)

        features = {
            "height": height,
            "width": width,
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "sharpness": round(sharpness, 2),
            "edge_density": round(float(edge_density), 4),
            "dominant_color": color_name,
            "dominant_color_rgb": dominant_color,
            "texture_contrast": round(float(texture_contrast), 2),
            "texture_energy": round(float(texture_energy), 4),
            "texture_homogeneity": round(float(texture_homogeneity), 4),
            "texture_entropy": round(float(entropy), 2)
        }
        quality_score = self.calculate_quality_score(features)
        if quality_score >= 90:
            grade = "A"
        elif quality_score >= 80:
            grade = "B"
        elif quality_score >= 70:
            grade = "C"
        elif quality_score >= 60:
            grade = "D"
        else:
            grade = "Poor"

        features["quality_score"] = round(quality_score, 2)
        features["quality_grade"] = grade

        return features


    def calculate_quality_score(self, features):

        score = 100.0

        # -------------------------
        # Brightness
        # -------------------------
        brightness = features["brightness"]

        # if brightness < 60:
        #     score -= 10
        # elif brightness > 200:
        #     score -= 10
        if brightness < 60:
            score -= 10

        elif brightness > 245:
            score -= 5

        # -------------------------
        # Contrast
        # -------------------------
        contrast = features["contrast"]

        if contrast < 20:
            score -= 10

        # -------------------------
        # Sharpness
        # -------------------------
        sharpness = features["sharpness"]

        if sharpness < 300:
            score -= 20

        # -------------------------
        # Edge Density
        # -------------------------
        edge = features["edge_density"]

        if edge < 0.05:
            score -= 10

        # -------------------------
        # Texture
        # -------------------------
        entropy = features["texture_entropy"]

        if entropy < 4:
            score -= 10

        return max(score, 0)