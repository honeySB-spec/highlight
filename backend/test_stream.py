import requests
import json
import os
import time

# Create a dummy PDF file for testing
dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources << >>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000157 00000 n\n0000000264 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n365\n%%EOF"

filename = "test_stream.pdf"
with open(filename, "wb") as f:
    f.write(dummy_pdf_content)

print(f"Created {filename}")

# 1. Upload
url_upload = "http://localhost:5001/upload"
with open(filename, "rb") as f:
    files = {"file": f}
    print("Uploading...")
    response = requests.post(url_upload, files=files)
    print(f"Upload status: {response.status_code}")
    print(f"Upload response: {response.text}")
    uploaded_filename = response.json().get("filename")

if not uploaded_filename:
    print("Upload failed, exiting.")
    exit(1)

# 2. Analyze with streaming
url_analyze = "http://localhost:5001/analyze"
print(f"\nAnalyzing {uploaded_filename} with streaming...")

start_time = time.time()
with requests.post(url_analyze, json={"filename": uploaded_filename}, stream=True) as r:
    print(f"Response status: {r.status_code}")
    print("Chunks received:")
    for line in r.iter_lines():
        if line:
            print(f"[{time.time() - start_time:.2f}s] {line.decode('utf-8')}")

print("\nDone.")
