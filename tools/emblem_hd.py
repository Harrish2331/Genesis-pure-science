"""
Build public/brand/genesis-emblem-hd.webp: the Genesis emblem with clean,
properly matted edges for dark backgrounds (the intro splash) as well as light
ones (the page-transition veil).

Why a separate asset
--------------------
The approved master (source-assets/genesis/genesis-logo-master-grey.png) is a
raster drawn on white. tools/brand_assets.py separates it from that white with
a strict threshold plus a 2-pixel colour-to-alpha band, which is invisible on
the site's near-white tints but leaves a ragged, whitish fringe on navy. Simply
widening that band darkens light edge colours into a visible outline.

Here each edge pixel is treated as a mix of the artwork's own colour and the
white backdrop (c = a*F + (1 - a)*W):
  - F, the artwork colour, is taken from the nearest solid interior pixels,
    propagated outward across the edge band;
  - a, the coverage, is the projection of (c - W) onto (F - W);
  - the pixel is then written as colour F with alpha a.
Interior pixels are untouched and nothing is redrawn, recoloured or resized:
the result is the same artwork at the master's native resolution, with the
white contamination removed from its anti-aliased edges.

Run:  python tools/emblem_hd.py
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import brand_assets as ba

BAND = 4  # edge band width in master pixels
NEAR_WHITE_ART = 40.0  # |F - W| below this: artwork itself is near-white (capsule), keep opaque
NOISE_WHITE = 230  # off-white specks (compression noise) in the backdrop: every channel at least this
MIN_ALPHA = 0.1  # coverage below this is backdrop noise, not artwork
WHITE_ART = 215  # artwork this light (the capsule's white half) has no edge against the white backdrop


def grow(mask: np.ndarray, r: int) -> np.ndarray:
    img = Image.fromarray((mask * 255).astype(np.uint8), "L")
    return np.array(img.filter(ImageFilter.MaxFilter(r * 2 + 1))) > 0


def shrink(mask: np.ndarray, r: int) -> np.ndarray:
    img = Image.fromarray((mask * 255).astype(np.uint8), "L")
    return np.array(img.filter(ImageFilter.MinFilter(r * 2 + 1))) > 0


def components(mask: np.ndarray):
    """Connected components (8-way) of a boolean mask, as a list of index arrays."""
    img = Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), "L")
    out, label = [], 1
    arr = np.array(img)
    while True:
        idx = np.argwhere(arr == 255)
        if len(idx) == 0 or label > 250:
            break
        y, x = idx[0]
        ImageDraw.floodfill(img, (int(x), int(y)), label, thresh=0)
        arr = np.array(img)
        out.append(np.nonzero(arr == label))
        label += 1
    return out


def white_edge(rgb: np.ndarray, bg: np.ndarray):
    """Where white artwork meets the white backdrop the master has no edge at
    all, so the separation there is a hard, stepped threshold. Return a smooth
    coverage for that edge so it is anti-aliased like every other edge.
    (Closing the small notch there was tried and rejected: it also filled real
    dark gaps between the capsule and the ribbons.)"""
    light = rgb.min(axis=2) >= WHITE_ART
    art = ~bg
    # Solid white artwork only (the capsule body): at least 5 px thick, so the
    # light anti-aliased rims of the coloured ribbons are never included.
    core = shrink(light & art, 2)
    # The capsule is the one large solid white area; keep only that.
    comps = components(core)
    if comps:
        biggest = max(comps, key=lambda c: len(c[0]))
        core = np.zeros_like(core)
        core[biggest] = True
    white_art = grow(core, 2) & light & art
    colored = grow(art & ~light, 2)
    boundary = grow(white_art, 1) & grow(bg, 1) & art
    zone = grow(boundary, 2) & ~colored
    cover = np.array(Image.fromarray((art * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.9))) / 255.0
    return bg, zone, cover, grow(core, 1)


def propagate(colors: np.ndarray, known: np.ndarray, todo: np.ndarray, steps: int):
    """Fill `todo` pixels with the mean colour of known 8-neighbours, ring by ring.
    Returns the colours and which pixels ended up with an estimate."""
    f = colors.astype(np.float64).copy()
    known = known.copy()
    h, w = known.shape
    for _ in range(steps):
        acc = np.zeros_like(f)
        cnt = np.zeros((h, w))
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                k = np.roll(np.roll(known, dy, 0), dx, 1)
                c = np.roll(np.roll(f, dy, 0), dx, 1)
                acc += c * k[:, :, None]
                cnt += k
        fill = todo & ~known & (cnt > 0)
        f[fill] = acc[fill] / cnt[fill][:, None]
        known |= fill
        if not (todo & ~known).any():
            break
    return f, known


def matte(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    bg, white_zone, white_cover, capsule = white_edge(rgb, bg)
    art = ~bg
    edge = grow(bg, BAND) & art
    interior = art & ~edge
    F, estimated = propagate(rgb, interior, edge, BAND + 4)

    c = rgb.astype(np.float64)
    W = 255.0
    d = c - W
    fw = F - W
    denom = (fw * fw).sum(axis=2)
    a = np.ones(bg.shape)
    ok = edge & (denom > NEAR_WHITE_ART**2)
    a[ok] = ((d[ok] * fw[ok]).sum(axis=1) / denom[ok]).clip(0.0, 1.0)
    # Isolated off-white specks in the backdrop: no artwork nearby to take a
    # colour from, and near-white themselves. They are noise, not artwork.
    specks = edge & ~estimated & (rgb.min(axis=2) >= NOISE_WHITE)
    a[specks] = 0.0
    a[ok & (a < MIN_ALPHA)] = 0.0
    a[bg] = 0.0
    # The white capsule edge: smooth coverage instead of a stepped threshold.
    wz = white_zone & ~ok & ~specks
    a[wz] = white_cover[wz]
    # Near-white edge pixels that are not part of the solid white capsule are
    # backdrop noise beside a light ribbon, not artwork.
    stray = edge & ~ok & ~wz & ~capsule & (rgb.min(axis=2) >= NOISE_WHITE)
    a[stray] = 0.0
    # White slivers between ribbons read as backdrop on the original white
    # artwork; remove small near-white clusters touching the backdrop.
    sliver = (a > 0) & (rgb.min(axis=2) >= 200) & grow(bg, 3) & ~capsule
    for comp in components(sliver):
        if len(comp[0]) < 400:
            a[comp] = 0.0

    out = c.copy()
    out[ok] = F[ok]
    out[bg] = 255.0
    out[wz] = np.maximum(c[wz], 0)  # white artwork keeps its own (white) colour
    return np.dstack([out, a * 255.0]).round().clip(0, 255).astype(np.uint8)


def main():
    rgb = np.asarray(Image.open(ba.MASTER).convert("RGB"))
    bg = ba.background_mask(rgb)
    rgba = Image.fromarray(matte(rgb, bg), "RGBA")
    alpha = np.asarray(rgba)[:, :, 3]

    # Same emblem crop as tools/brand_assets.py: everything above the first
    # empty row between the symbol and the wordmark.
    y0, x0, y1, x1 = ba.bbox(alpha)
    rows = (alpha[y0:y1, x0:x1] > 8).sum(axis=1)
    start = int((y1 - y0) * 0.55)
    gap = next(y0 + i for i in range(start, len(rows)) if rows[i] == 0)
    em_alpha = alpha.copy()
    em_alpha[gap:, :] = 0
    emblem = ba.pad_crop(rgba, ba.bbox(em_alpha), 6)
    # Clear anything of the wordmark that falls inside the padded crop.
    e = np.array(emblem)
    ey0 = ba.bbox(em_alpha)[0] - 6
    e[max(0, gap - ey0):, :, 3] = 0
    emblem = Image.fromarray(e, "RGBA")

    emblem.save(ba.OUT / "genesis-emblem-hd.webp", quality=96, alpha_quality=100, method=6)
    print("emblem-hd", emblem.size)


if __name__ == "__main__":
    main()
