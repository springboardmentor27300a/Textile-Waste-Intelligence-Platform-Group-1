import os
import shutil

# Original Dataset
SOURCE_DIR = "../dataset/StitchingNet"

# New Dataset
DEST_DIR = "../dataset/fabric_dataset"

os.makedirs(DEST_DIR, exist_ok=True)

# Loop through each fabric folder
for fabric_folder in os.listdir(SOURCE_DIR):

    fabric_path = os.path.join(SOURCE_DIR, fabric_folder)

    if not os.path.isdir(fabric_path):
        continue

    # Remove A. B. C. etc.
    fabric_name = fabric_folder.split(". ", 1)[1]
    fabric_name = fabric_name.split("-")[0].strip()
    fabric_name = fabric_name.replace(" ", "_")

    destination = os.path.join(DEST_DIR, fabric_name)

    os.makedirs(destination, exist_ok=True)

    print(f"Processing {fabric_name}...")

    # Loop through defect folders
    for defect_folder in os.listdir(fabric_path):

        defect_path = os.path.join(fabric_path, defect_folder)

        if not os.path.isdir(defect_path):
            continue

        for file in os.listdir(defect_path):

            if file.lower().endswith((".jpg", ".jpeg", ".png")):

                src = os.path.join(defect_path, file)

                dst = os.path.join(
                    destination,
                    f"{defect_folder}_{file}"
                )

                shutil.copy2(src, dst)

print("\nDataset Prepared Successfully!")