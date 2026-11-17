"""Film-grade the rasterised Experience archive plate (Phase 6.4).

`scripts/render-scene.py` rasterises the hand-authored SVG; this pass gives the
plate a photographic finish without changing its composition:

  * soft highlight bloom around the lanterns,
  * a gentle radial depth-of-field falloff at the frame edges,
  * restrained warm-highlight / cool-shadow grading,
  * a film-grain and vignette pass.

It never raises the central luminance enough to threaten the ledger's contrast
(the target is a mean < 40/255 over the copy area).

Usage:
    python scripts/grade-experience-plate.py <in.png> <out.webp> [quality]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = int(sys.argv[3]) if len(sys.argv) > 3 else 84


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / max(1e-6, edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def main():
    im = Image.open(SRC).convert("RGB")
    w, h = im.size
    base = np.asarray(im, dtype=np.float32) / 255.0

    # --- bloom -------------------------------------------------------
    lum = base[:, :, 0] * 0.2126 + base[:, :, 1] * 0.7152 + base[:, :, 2] * 0.0722
    mask = smoothstep(0.42, 0.92, lum)[:, :, None]
    bright = base * mask

    def blurred(arr, radius):
        return np.asarray(
            Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(radius)
            ),
            dtype=np.float32,
        ) / 255.0

    bloom = blurred(bright, 46) * 0.26 + blurred(bright, 13) * 0.16
    graded = 1.0 - (1.0 - base) * (1.0 - np.clip(bloom, 0, 1) * 0.9)

    # --- depth of field ---------------------------------------------
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w * 0.5, h * 0.42
    dist = np.sqrt(((xx - cx) / (w * 0.5)) ** 2 + ((yy - cy) / (h * 0.5)) ** 2) / 1.42
    dof = smoothstep(0.42, 1.0, dist)
    dof = (dof * 0.72)[:, :, None]
    soft = blurred(graded, 5.5)
    graded = graded * (1 - dof) + soft * dof

    # --- grade -------------------------------------------------------
    # cool shadows, warm highlights
    lum2 = (graded[:, :, 0] * 0.2126 + graded[:, :, 1] * 0.7152 + graded[:, :, 2] * 0.0722)[
        :, :, None
    ]
    shadow = np.clip(1.0 - lum2 * 3.2, 0, 1)[:, :, 0]
    highlight = np.clip((lum2 - 0.25) * 2.0, 0, 1)[:, :, 0]
    graded[:, :, 2] += 0.012 * shadow          # cool blue lift in the darks
    graded[:, :, 1] += 0.006 * shadow
    graded[:, :, 0] += 0.028 * highlight       # warm lantern bloom
    graded[:, :, 1] += 0.012 * highlight

    # gentle S-curve + protect the blacks
    graded = np.clip(graded, 0, 1)
    graded = graded * graded * (3 - 2 * graded) * 0.55 + graded * 0.45
    graded = graded * 0.985 + 0.006

    # vignette
    vg = 1.0 - 0.3 * smoothstep(0.35, 1.05, dist)
    graded *= vg[:, :, None]

    # grain (strongest in the midtones)
    rng = np.random.default_rng(164)
    grain = rng.normal(0, 1, (h, w, 1)).astype(np.float32)
    mid = np.clip(1.0 - np.abs(lum2 * 2 - 0.7), 0.15, 1.0)
    graded += grain * 0.014 * mid
    graded = np.clip(graded, 0, 1)

    out = Image.fromarray((graded * 255 + 0.5).astype(np.uint8))
    out.save(OUT, "WEBP", quality=QUALITY, method=6)
    print(f"{OUT}: {out.size[0]}x{out.size[1]} {os_size(OUT)}")


def os_size(path):
    import os

    return f"{os.path.getsize(path) / 1024:.0f} KB"


main()
