"""
Full Pipeline Test — Image Upload + AI Analysis
Tests every endpoint in the image-analysis workflow.
"""
import sys, json, urllib.request, urllib.parse, urllib.error

BASE = "http://127.0.0.1:8000"

# Minimal valid 1x1 RGB PNG (67 bytes)
PNG_1x1 = bytes([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
    0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,
    0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
    0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,
    0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
    0x44,0xae,0x42,0x60,0x82
])

def multipart_body(file_bytes, filename, mime_type, boundary):
    crlf = b"\r\n"
    return (
        b"--" + boundary.encode() + crlf
        + b'Content-Disposition: form-data; name="file"; filename="' + filename.encode() + b'"' + crlf
        + b"Content-Type: " + mime_type.encode() + crlf
        + crlf + file_bytes + crlf
        + b"--" + boundary.encode() + b"--" + crlf
    )

def api(path, method="GET", body=None, token=None, raw_body=None, raw_content_type=None):
    url = BASE + path
    headers = {}
    if token:
        headers["Authorization"] = "Bearer " + token
    if raw_body is not None:
        req = urllib.request.Request(url, method=method, data=raw_body, headers=headers)
        if raw_content_type:
            req.add_header("Content-Type", raw_content_type)
    elif body is not None:
        req = urllib.request.Request(url, method=method, data=json.dumps(body).encode(), headers=headers)
        req.add_header("Content-Type", "application/json")
    else:
        req = urllib.request.Request(url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            detail = json.loads(e.read().decode())
        except Exception:
            detail = {"detail": str(e)}
        return e.code, detail

PASS = "[PASS]"
FAIL = "[FAIL]"

def check(label, code, data, expected=200):
    ok = code == expected
    print("  %s [%d] %s" % (PASS if ok else FAIL, code, label))
    if not ok:
        print("       Detail: %s" % str(data)[:300])
    return ok

print("\n" + "="*60)
print("  FULL PIPELINE TEST")
print("="*60)

# Step 0: Health
print("\n[0] Health Check")
code, data = api("/health")
if not check("GET /health", code, data): sys.exit(1)
print("       App: %s v%s" % (data.get("app"), data.get("version")))

# Step 1: Login
print("\n[1] Authentication")
code, data = api("/api/auth/login", method="POST", body={"email": "pipelinetest@test.com", "password": "Test@1234"})
if not check("POST /api/auth/login", code, data): sys.exit(1)
TOKEN = data.get("access_token")
user_info = data.get("user", {})
print("       User: %s | Role: %s" % (user_info.get("email"), user_info.get("role")))

# Step 2: Upload Image
print("\n[2] Image Upload")
boundary = "PythonBoundary7MA4YWxkTrZu0gW"
body_bytes = multipart_body(PNG_1x1, "test_textile.png", "image/png", boundary)
content_type = "multipart/form-data; boundary=" + boundary
code, data = api("/image/upload", method="POST", token=TOKEN, raw_body=body_bytes, raw_content_type=content_type)
if not check("POST /image/upload", code, data, expected=201): sys.exit(1)
IMAGE_ID  = data.get("id")
FILE_URL  = data.get("file_url")
FILENAME  = data.get("filename")
print("       Image ID  : %s" % IMAGE_ID)
print("       File URL  : %s" % FILE_URL)
print("       Filename  : %s" % FILENAME)
print("       Size      : %s bytes" % data.get("file_size"))
print("       MIME      : %s" % data.get("mime_type"))

# Step 3: Static file serving
print("\n[3] Static File Serving")
try:
    with urllib.request.urlopen(FILE_URL) as resp:
        print("  %s [%d] GET /uploads/%s" % (PASS, resp.status, FILENAME))
        print("       Content-Type: %s" % resp.headers.get("Content-Type"))
except Exception as e:
    print("  %s Static file not accessible: %s" % (FAIL, e))

# Step 4: Material Classification
print("\n[4] Material Classification")
code, data = api("/classification/material", method="POST", token=TOKEN, body={"image_id": IMAGE_ID})
if not check("POST /classification/material", code, data): sys.exit(1)
MATERIAL   = data.get("material")
CONFIDENCE = data.get("confidence")
print("       Material         : %s" % MATERIAL)
print("       Confidence       : %s%%" % CONFIDENCE)
print("       Fabric Type      : %s" % data.get("fabric_type"))
print("       Fiber Composition: %s" % data.get("fiber_composition"))
print("       Material Quality : %s" % data.get("material_quality"))

# Step 5: Waste Classification
print("\n[5] Waste Classification")
code, data = api("/classification/waste", method="POST", token=TOKEN, body={"material": MATERIAL})
if not check("POST /classification/waste", code, data): sys.exit(1)
CATEGORY = data.get("category")
print("       Waste Category  : %s" % CATEGORY)
print("       Confidence      : %s%%" % data.get("confidence"))
print("       Handling        : %s" % data.get("handling"))
print("       Recyclability   : %s" % data.get("recyclability_assessment"))
print("       Reuse Potential : %s" % data.get("reuse_potential"))

# Step 6: Recommendations
print("\n[6] Recycling Recommendations")
code, data = api("/classification/recommendations", method="POST", token=TOKEN, body={
    "material": MATERIAL, "category": CATEGORY, "image_id": IMAGE_ID
})
if not check("POST /classification/recommendations", code, data): sys.exit(1)
recs = data.get("recommendations", [])
print("       Count: %d recommendations" % len(recs))
for i, r in enumerate(recs[:3], 1):
    if isinstance(r, dict):
        print("       %d. %s" % (i, r.get("action", r)))
    else:
        print("       %d. %s" % (i, r))

# Step 7: Recyclability Assessment
print("\n[7] Recyclability Assessment")
code, data = api("/assessment/recyclability", method="POST", token=TOKEN, body={
    "material": MATERIAL, "condition": "good", "contamination": "low"
})
if not check("POST /assessment/recyclability", code, data): sys.exit(1)
print("       Score : %s" % data.get("score"))
print("       Status: %s" % data.get("status"))

# Step 8: Image Analysis (unified — runs the ML model)
print("\n[8] Unified Image Analysis (ML Model)")
code, data = api("/image/analyze/%s" % IMAGE_ID, method="POST", token=TOKEN)
if code == 200:
    print("  %s [%d] POST /image/analyze/%s" % (PASS, code, IMAGE_ID))
    mat_cls  = data.get("material_classification", {})
    waste_cls = data.get("waste_classification", {})
    print("       Fabric Detection  : %s" % data.get("fabric_detection"))
    print("       Material (ML)     : %s (%.1f%%)" % (mat_cls.get("material","?"), mat_cls.get("confidence", 0)))
    print("       Waste Category    : %s" % waste_cls.get("category","?"))
    print("       Overall Confidence: %.1f%%" % data.get("overall_confidence", 0))
    ANA_MAT = mat_cls.get("material", MATERIAL)
else:
    print("  %s [%d] POST /image/analyze/%s  (non-fatal, model may be slow)" % (FAIL, code, IMAGE_ID))
    print("       Detail: %s" % str(data)[:200])
    ANA_MAT = MATERIAL

# Step 9: Report
print("\n[9] AI Report")
code, data = api("/report/%s" % IMAGE_ID, token=TOKEN)
if check("GET /report/%s" % IMAGE_ID, code, data):
    print("       Material          : %s" % data.get("material"))
    print("       Waste Category    : %s" % data.get("waste_category"))
    print("       Recyclability     : %s" % data.get("recyclability_score"))
    print("       Recovery Status   : %s" % data.get("recovery_status"))

# Step 10: Get image record
print("\n[10] Get Image Record")
code, data = api("/image/%s" % IMAGE_ID, token=TOKEN)
check("GET /image/%s" % IMAGE_ID, code, data)
print("       ID       : %s" % data.get("id"))
print("       Filename : %s" % data.get("filename"))
print("       Uploaded : %s" % data.get("uploaded_at"))

# Step 11: List images
print("\n[11] List Images")
code, data = api("/image", token=TOKEN)
check("GET /image", code, data)
print("       Total images in DB: %s" % data.get("total", "?"))

# Step 12: AI Stats
print("\n[12] AI Stats Summary")
code, data = api("/report/stats/summary", token=TOKEN)
check("GET /report/stats/summary", code, data)
print("       Total images analysed: %s" % data.get("total_images"))

print("\n" + "="*60)
print("  ALL STEPS COMPLETE")
print("="*60 + "\n")
