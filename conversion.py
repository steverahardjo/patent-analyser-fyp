import pytesseract
from PIL import Image
import pdf2image

# Convert PDF pages to images
# pages = pdf2image.convert_from_path("US_12145469_B1_I.pdf")

# US_12145469_B1_I.pdf
# poppler_path = "/usr/local/bin"  # Adjust if `which pdfinfo` gives a different path
# pages = pdf2image.convert_from_path("frontend/US_12145469_B1_I.pdf", poppler_path=poppler_path)

# US_12145469_B1_I.pdf
poppler_path = "/usr/local/bin"  # Update with actual path
pages = pdf2image.convert_from_path("frontend/20240372172.pdf", poppler_path=poppler_path)

# Apply OCR to each page
text = "\n".join([pytesseract.image_to_string(page) for page in pages])

print(text)
