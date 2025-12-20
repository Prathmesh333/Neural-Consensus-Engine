from pypdf import PdfReader
import sys

try:
    reader = PdfReader("Neural Consensus Engine Development Plan.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open("pdf_content_utf8.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Done")
except Exception as e:
    print(f"Error reading PDF: {e}")
