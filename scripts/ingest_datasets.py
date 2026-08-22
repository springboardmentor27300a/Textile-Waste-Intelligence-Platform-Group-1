"""
Confirms a downloaded dataset is really on disk and updates the dataset
registry with a real record count.

Usage:
    python scripts/ingest_datasets.py fashion-mnist ./data/raw/fashion-mnist
    python scripts/ingest_datasets.py sustainable-fashion-dataset-kaggle ./data/raw/sustainable-fashion
"""
import csv, gzip, os, struct, sys
import requests

API = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@textilewaste.io"
ADMIN_PASSWORD = "Admin@12345"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}


def count_idx_images(path):
    opener = gzip.open if path.endswith(".gz") else open
    with opener(path, "rb") as f:
        header = f.read(8)
    _, count = struct.unpack(">II", header)
    return count


def count_records(path):
    if os.path.isfile(path) and path.lower().endswith(".csv"):
        with open(path, newline="", encoding="utf-8", errors="ignore") as f:
            return max(sum(1 for _ in csv.reader(f)) - 1, 0)
    if os.path.isdir(path):
        for entry in os.listdir(path):
            if entry.lower().endswith(".csv"):
                return count_records(os.path.join(path, entry))
        idx_total = 0
        for root, _, files in os.walk(path):
            for fname in files:
                if "images-idx3-ubyte" in fname:
                    idx_total += count_idx_images(os.path.join(root, fname))
        if idx_total > 0:
            return idx_total
        total = 0
        for root, _, files in os.walk(path):
            total += sum(1 for f in files if os.path.splitext(f)[1].lower() in IMAGE_EXTS)
        return total
    raise FileNotFoundError(f"Nothing found at {path}.")


def main():
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(1)
    slug, local_path = sys.argv[1], os.path.abspath(sys.argv[2])
    print(f"Scanning {local_path} ...")
    count = count_records(local_path)
    if count == 0:
        print("Found 0 records."); sys.exit(1)
    print(f"Found {count} real records on disk.")

    token = requests.post(f"{API}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    datasets = requests.get(f"{API}/datasets", headers=headers).json()
    match = next((d for d in datasets if d["slug"] == slug), None)
    if not match:
        print(f"No dataset registered with slug '{slug}'."); sys.exit(1)
    requests.patch(f"{API}/datasets/{match['id']}/status", headers=headers,
                    params={"status": "ready", "record_count": count, "local_path": local_path}).raise_for_status()
    print(f"Updated '{match['name']}' -> status=ready, record_count={count}")


if __name__ == "__main__":
    main()
