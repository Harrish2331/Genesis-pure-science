/**
 * The Genesis emblem as used by the intro and the page-transition veil.
 *
 * This is the symbol from the approved master artwork at its full native
 * resolution (no vector or larger full-colour master exists), with properly
 * matted edges so it stays clean on the navy intro as well as on light
 * backgrounds — see tools/emblem_hd.py. It is served as-is (`unoptimized`):
 * the image optimiser's quality-75 re-encode visibly softened the emblem's
 * gradients and fine molecule stem. Every use points at this one URL, so the
 * browser downloads it once and reuses it, including for the CSS mask of the
 * intro's light sweep.
 */
export const EMBLEM = { src: "/brand/genesis-emblem-hd.webp", width: 422, height: 491 } as const;
