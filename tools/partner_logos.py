"""
Give every manufacturing-partner logo a transparent background, so the logos
sit on the site's own surfaces instead of inside a visible box.

    python tools/partner_logos.py

The supplied files are copied once to source-assets/partners-original and
every run works from those copies, so the step is repeatable. Output keeps
each file's name and pixel size (the content store records both).

  * Logos on a plain light background: the background is flood-filled from
    the image edges (so white details inside a logo stay opaque), and the
    pixels along its boundary are un-mixed from the background colour, which
    keeps anti-aliased edges smooth instead of haloed.
  * Logos photographed on a neutral surface (Amagen's gold mark on grey): the
    surface is keyed out by saturation — the mark is coloured, the wall and
    its shadows are not — and the mark's colour is un-mixed from the wall.
"""
from __future__ import annotations

import re
import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
LIVE = ROOT / "public/partners"
ORIG = ROOT / "source-assets/partners-original"

SATURATION_KEYED = {"amagen-pharma.webp"}
TOLERANCE = 26  # how far (max channel difference) a pixel may be from the background and still count as it
EDGE_BAND = 2  # pixels beside the background whose colour is un-mixed from it


def border_colour(px: np.ndarray) -> np.ndarray:
    edge = np.concatenate([px[0], px[-1], px[:, 0], px[:, -1]])
    return np.median(edge, axis=0)


def flood(px: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """Background pixels connected to the image border."""
    h, w, _ = px.shape
    near = np.abs(px - bg).max(axis=2) <= TOLERANCE
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def unmix(px: np.ndarray, bg: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Colour-to-alpha against bg: the least opacity that explains each pixel."""
    diff = px - bg
    lim = np.where(diff >= 0, 255 - bg, bg)  # room to move toward white or black
    a = np.clip((np.abs(diff) / np.maximum(lim, 1)).max(axis=2), 0, 1)
    col = np.where(a[..., None] > 0, bg + diff / np.maximum(a[..., None], 1e-6), px)
    return np.clip(col, 0, 255), a


def plain(px: np.ndarray) -> np.ndarray:
    bg = border_colour(px)
    back = flood(px, bg)
    band = np.array(Image.fromarray((back * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(EDGE_BAND * 2 + 1))) > 0
    band &= ~back
    col, a = unmix(px, bg)
    alpha = np.ones(px.shape[:2])
    alpha[back] = 0
    alpha[band] = a[band]
    out = px.copy()
    out[band] = col[band]
    return np.dstack([out, alpha * 255])


def keyed(px: np.ndarray) -> np.ndarray:
    mx = px.max(axis=2)
    mn = px.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    t = np.clip((sat - 0.12) / (0.30 - 0.12), 0, 1)
    alpha = t * t * (3 - 2 * t)  # smoothstep
    # The wall's own colour, estimated from clearly neutral pixels.
    bg = np.median(px[sat < 0.06], axis=0)
    a = np.maximum(alpha[..., None], 1e-3)
    col = np.clip(bg + (px - bg) / a, 0, 255)
    col = np.where(alpha[..., None] > 0.98, px, col)
    return np.dstack([col, alpha * 255])


def main() -> None:
    ORIG.mkdir(parents=True, exist_ok=True)
    # Only the logos the partner records use; other files in the folder are left alone.
    used = set(re.findall(r'"/partners/([^"]+\.webp)"', (ROOT / "src/content/partners.ts").read_text(encoding="utf8")))
    for f in sorted(LIVE / n for n in used):
        src = ORIG / f.name
        if not src.exists():
            shutil.copyfile(f, src)
        px = np.asarray(Image.open(src).convert("RGB")).astype(np.float64)
        rgba = keyed(px) if f.name in SATURATION_KEYED else plain(px)
        im = Image.fromarray(np.round(rgba).astype(np.uint8), "RGBA")
        im.save(f, "WEBP", quality=92, method=6, exact=True)
        clear = (rgba[..., 3] < 8).mean()
        print(f"{f.name}: {im.size[0]}x{im.size[1]}, {clear:.0%} transparent")


if __name__ == "__main__":
    main()
