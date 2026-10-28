"""
Prepare product images from the client-supplied assets in public/products.

  · Pack shots (DVITS and the seven 2026-10-20 WhatsApp images) are re-encoded
    to WebP under a slug name. Pixels are unchanged.
  · Products that exist only on the "product ranges.jpeg" sheet have no pack
    photograph, so each product's own printed block is cropped from the sheet
    as supplied (name, form and composition exactly as printed) and placed on
    a white 4:3 canvas. Nothing is redrawn. The sheet's four redacted rows
    are not used.

Run:  python tools/product_images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/products"
OUT = ROOT / "public/products"

PACKS = {
    "WhatsApp Image 2026-10-20 at 4.26.10 PM.jpeg": "mifestand-kit",
    "WhatsApp Image 2026-10-20 at 4.26.11 PM.jpeg": "novarg",
    "WhatsApp Image 2026-10-20 at 4.26.11 PM (1).jpeg": "leesam",
    "WhatsApp Image 2026-10-20 at 4.26.11 PM (2).jpeg": "encical",
    "WhatsApp Image 2026-10-20 at 4.26.11 PM (3).jpeg": "chinfol-m",
    "WhatsApp Image 2026-10-20 at 4.26.12 PM.jpeg": "movacal",
    "WhatsApp Image 2026-10-20 at 4.26.12 PM (1).jpeg": "labenova",
    "dvits.jpeg": "d-vits-60k",
}

# (x0, y0, x1, y1) on the 1024 x 1536 sheet. Rows are separated by printed
# rules at y = 456, 671, 855 and 1009; columns by the centre rule at x = 511.
SHEET = "product ranges.jpeg"
BLOCKS = {
    "meconia-inj": (78, 228, 505, 452),
    "meconia-pfs-inj": (532, 228, 848, 452),
    "meconia-tab": (78, 462, 505, 668),
    "meq-d3": (532, 505, 1000, 668),
    "meq-7": (78, 676, 505, 852),
    "rubgo": (532, 676, 1000, 852),
    "gasco": (78, 860, 505, 1006),
    "sucra-l": (532, 860, 1000, 1006),
}


def main():
    for src, slug in PACKS.items():
        im = Image.open(SRC / src).convert("RGB")
        im.save(OUT / f"{slug}.webp", quality=88, method=6)
        print(slug, im.size)

    sheet = Image.open(SRC / SHEET).convert("RGB")
    for slug, box in BLOCKS.items():
        crop = sheet.crop(box)
        w, h = crop.size
        # White 4:3 canvas with even padding; the crop is scaled up 2x (Lanczos)
        # so it stays legible in product cards.
        crop = crop.resize((w * 2, h * 2), Image.LANCZOS)
        W = max(crop.width + 160, round((crop.height + 160) * 4 / 3))
        H = round(W * 3 / 4)
        # Fill with the sheet's own background tint so no box edge shows.
        canvas = Image.new("RGB", (W, H), crop.getpixel((4, 4)))
        canvas.paste(crop, ((W - crop.width) // 2, (H - crop.height) // 2))
        canvas.save(OUT / f"{slug}.webp", quality=90, method=6)
        print(slug, canvas.size)


if __name__ == "__main__":
    main()
