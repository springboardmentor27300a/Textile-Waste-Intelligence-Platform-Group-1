import os
import sys

print("Python version:", sys.version)

packages = ["openai", "flask", "google-generativeai", "jinja2", "requests", "pydantic", "matplotlib", "pandas", "pdfkit", "reportlab"]
print("\nPackage status:")
for pkg in packages:
    try:
        __import__(pkg)
        print(f"  {pkg}: installed")
    except ImportError:
        print(f"  {pkg}: NOT installed")

print("\nRelevant environment variables:")
keys_to_check = ["OPENAI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "PORT"]
for key in keys_to_check:
    val = os.environ.get(key)
    if val:
        print(f"  {key}: FOUND (length {len(val)})")
    else:
        print(f"  {key}: NOT FOUND")
