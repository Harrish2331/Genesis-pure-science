"""
Prepare the Genesis Pure Lifesciences display assets from the approved artwork.

Source of truth
---------------
source-assets/genesis/genesis-logo-master-grey.png is the 1254 x 1254 raster
embedded on page 2 (Grey / Slate wordmark) of the client's
"GENESIS_Pure_Lifesciences_Both_Variations main.pdf" - the most recent
approved artwork supplied (14 Oct 2026), and the variant the brand guidelines
name as primary (wordmark in Slate). The pixels of the artwork are never
redrawn, recoloured, stretched or rearranged here. This script only:

  1. separates the plain white backdrop from the artwork (for transparent
     variants),
  2. trims the large white margin around the lockup,
  3. resizes uniformly and re-encodes (PNG / WebP / ICO).

Why the background mask is built the way it is
----------------------------------------------
The capsule's white half is almost the same colour as the backdrop. A loose
flood fill (any pixel lighter than ~246) leaks straight into it and makes
half of the capsule transparent - verified visually during preparation. The
mask therefore floods only pixels that are essentially pure white (>= 250 in
every channel) from the canvas edge, adds the one enclosed backdrop pocket
between the molecular stem and the upper ribbon, and then softens only a
2-pixel band along that boundary so edges stay anti-aliased on tinted
backgrounds.

Run:  python tools/brand_assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "source-assets/genesis/genesis-logo-master-grey.png"
AXON = ROOT / "source-assets/axon/AXON_Surgicals_Original_transparent.png"
OUT = ROOT / "public/brand"
APP = ROOT / "src/app"

STRICT_WHITE = 250
# The backdrop pocket enclosed by the molecular stem and the upper ribbon,
# located while preparing the assets (y0, x0, y1, x1 in master pixels).
POCKETS = [(300, 610, 400, 720)]
EDGE_BAND = 2


def background_mask(rgb: np.ndarray) -> np.ndarray:
    mn = rgb.min(axis=2)
    near = Image.fromarray(((mn >= STRICT_WHITE) * 255).astype(np.uint8), "L").copy()
    ImageDraw.floodfill(near, (0, 0), 100)
    arr = np.array(near)
    bg = arr == 100
    # Enclosed pockets: flood within the pocket box only.
    for (y0, x0, y1, x1) in POCKETS:
        sub = arr[y0:y1, x0:x1]
        ys, xs = np.nonzero(sub == 255)
        if len(ys) == 0:
            continue
        # The largest enclosed region in the box is the pocket.
        lab = Image.fromarray(np.where(sub == 255, 255, 0).astype(np.uint8)).copy()
        best = None
        v = 1
        while True:
            idx = np.argwhere(np.array(lab) == 255)
            if len(idx) == 0 or v > 200:
                break
            y, x = idx[0]
            ImageDraw.floodfill(lab, (int(x), int(y)), v)
            size = int((np.array(lab) == v).sum())
            if best is None or size > best[0]:
                best = (size, v)
            v += 1
        if best:
            pocket = np.array(lab) == best[1]
            bg[y0:y1, x0:x1] |= pocket
    return bg


def to_rgba(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """Alpha 0 on the backdrop, colour-to-alpha (from white) on a thin edge
    band, fully opaque everywhere else."""
    bg_img = Image.fromarray((bg * 255).astype(np.uint8), "L")
    grown = np.array(bg_img.filter(ImageFilter.MaxFilter(EDGE_BAND * 2 + 1))) > 0
    band = grown & ~bg

    f = rgb.astype(np.float64)
    alpha = np.ones(bg.shape)
    alpha[bg] = 0.0

    # Colour-to-alpha against white for the band only.
    a_band = ((255.0 - f[band]).max(axis=1) / 255.0).clip(0.0, 1.0)
    alpha[band] = a_band
    out = f.copy()
    safe = np.where(a_band > 1e-3, a_band, 1.0)[:, None]
    out[band] = (255.0 - (255.0 - f[band]) / safe).clip(0, 255)
    out[bg] = 255.0

    rgba = np.dstack([out, alpha * 255.0]).round().astype(np.uint8)
    return rgba


def bbox(alpha: np.ndarray, thresh: int = 8):
    ys, xs = np.nonzero(alpha > thresh)
    return int(ys.min()), int(xs.min()), int(ys.max()) + 1, int(xs.max()) + 1


def pad_crop(img: Image.Image, box, pad: int) -> Image.Image:
    y0, x0, y1, x1 = box
    return img.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))


def on_white(rgba: Image.Image) -> Image.Image:
    base = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    base.alpha_composite(rgba)
    return base.convert("RGB")


def square(img: Image.Image, size: int, fill=(0, 0, 0, 0), inset: float = 0.08) -> Image.Image:
    """Fit `img` inside a square canvas, uniformly scaled, centred."""
    canvas = Image.new("RGBA", (size, size), fill)
    inner = int(size * (1 - inset * 2))
    w, h = img.size
    s = inner / max(w, h)
    resized = img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = np.asarray(Image.open(MASTER).convert("RGB"))
    bg = background_mask(rgb)
    rgba = Image.fromarray(to_rgba(rgb, bg), "RGBA")
    alpha = np.asarray(rgba)[:, :, 3]

    # ── Full lockup ────────────────────────────────────────────────────────
    full_box = bbox(alpha)
    full = pad_crop(rgba, full_box, 6)
    full.save(OUT / "genesis-logo-transparent.png", optimize=True)
    white = on_white(full)
    white.save(OUT / "genesis-logo.png", optimize=True)
    white.save(OUT / "genesis-logo.webp", quality=95, method=6)
    full.save(OUT / "genesis-logo-transparent.webp", quality=95, method=6, lossless=False)

    # ── Symbol only (emblem) ───────────────────────────────────────────────
    # The emblem ends where the first fully empty row above the wordmark is.
    y0, x0, y1, x1 = full_box
    rows = (alpha[y0:y1, x0:x1] > 8).sum(axis=1)
    gap = None
    start = int((y1 - y0) * 0.55)
    for i in range(start, len(rows)):
        if rows[i] == 0:
            gap = y0 + i
            break
    if gap is None:
        raise SystemExit("Could not find the gap between emblem and wordmark")
    emblem_alpha = alpha.copy()
    emblem_alpha[gap:, :] = 0
    e_box = bbox(emblem_alpha)
    emblem = pad_crop(rgba, e_box, 6)
    emblem.save(OUT / "genesis-emblem.png", optimize=True)
    emblem.save(OUT / "genesis-emblem.webp", quality=95, method=6)
    on_white(emblem).save(OUT / "genesis-emblem-white.png", optimize=True)

    # ── App icons ──────────────────────────────────────────────────────────
    icon = square(emblem, 512, inset=0.04)
    icon.save(APP / "icon.png", optimize=True)
    apple = square(emblem, 180, fill=(255, 255, 255, 255), inset=0.1).convert("RGB")
    apple.save(APP / "apple-icon.png", optimize=True)
    ico_base = square(emblem, 256, inset=0.02)
    ico_base.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    # Manifest / PWA icons.
    square(emblem, 192, fill=(255, 255, 255, 255), inset=0.1).convert("RGB").save(OUT / "icon-192.png", optimize=True)
    square(emblem, 512, fill=(255, 255, 255, 255), inset=0.1).convert("RGB").save(OUT / "icon-512.png", optimize=True)

    # ── Axon Surgicals (supplied transparent PNG, trimmed + downsized) ──────
    axon = Image.open(AXON).convert("RGBA")
    a_alpha = np.asarray(axon)[:, :, 3]
    axon = pad_crop(axon, bbox(a_alpha), 10)
    target_w = 1400
    s = target_w / axon.width
    axon = axon.resize((target_w, round(axon.height * s)), Image.LANCZOS)
    axon.save(OUT / "axon-surgicals-logo.png", optimize=True)
    axon.save(OUT / "axon-surgicals-logo.webp", quality=92, method=6)

    # ── Social sharing image (1200 x 630) ──────────────────────────────────
    og = Image.new("RGBA", (1200, 630), (255, 255, 255, 255))
    deco = Image.new("RGBA", og.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(deco)
    # Soft blue and lime glows, drawn as concentric translucent discs.
    for i in range(60, 0, -1):
        r = i * 7
        d.ellipse((1000 - r, -60 - r, 1000 + r, -60 + r), fill=(32, 167, 219, int(2.2 * (60 - i) / 6)))
        d.ellipse((120 - r, 690 - r, 120 + r, 690 + r), fill=(155, 217, 107, int(2.6 * (60 - i) / 6)))
    og.alpha_composite(deco)
    # Brand gradient rule along the bottom edge.
    rule = Image.new("RGBA", (1200, 8))
    stops = [(8, 126, 205), (32, 167, 219), (65, 177, 131), (155, 217, 107)]
    for x in range(1200):
        t = x / 1199 * (len(stops) - 1)
        i0 = min(int(t), len(stops) - 2)
        f = t - i0
        c = tuple(round(stops[i0][k] + (stops[i0 + 1][k] - stops[i0][k]) * f) for k in range(3))
        for y in range(8):
            rule.putpixel((x, y), c + (255,))
    og.alpha_composite(rule, (0, 622))
    logo_h = 470
    logo = full.resize((round(full.width * logo_h / full.height), logo_h), Image.LANCZOS)
    og.alpha_composite(logo, ((1200 - logo.width) // 2, (622 - logo_h) // 2))
    og.convert("RGB").save(APP / "opengraph-image.png", optimize=True)
    og.convert("RGB").save(APP / "twitter-image.png", optimize=True)
    for name in ("opengraph-image.alt.txt", "twitter-image.alt.txt"):
        (APP / name).write_text("Genesis Pure Lifesciences logo", encoding="utf-8")

    print("full lockup", full.size, "emblem", emblem.size, "gap row", gap, "axon", axon.size)


if __name__ == "__main__":
    main()
