"""Author the sand wall used by the BugWiser split reveal.

The wall is generated texture, not an application screenshot: a dark sand body
with billowing cavities, fine glints and a bright, ragged inner edge. One
texture is emitted and mirrored in CSS for the opposite bank, so the page only
downloads a single ~300 KB image. The small grain tile

  public/assets/missions/bugwiser/sand-grain.png

is layered on top in CSS for close-up detail.

Output:
  public/assets/missions/bugwiser/sand-wall.png

Usage: python scripts/build-sand-wall.py
"""

import os

import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join("public", "assets", "missions", "bugwiser")
W, H = 760, 1064
rng = np.random.default_rng(197)


def noise_field(columns: int) -> np.ndarray:
    """Long horizontal sand streaks: coarse across x, detailed across y."""
    base = rng.random((H, columns)).astype(np.float32)
    image = Image.fromarray((base * 255).astype(np.uint8)).resize(
        (W, H), Image.BICUBIC
    )
    return np.asarray(image, dtype=np.float32) / 255.0


def contour(points: int, blur: float) -> np.ndarray:
    """A one-dimensional ragged offset for the inner edge."""
    base = rng.random(points).astype(np.float32)
    image = Image.fromarray((base * 255).astype(np.uint8).reshape(points, 1)).resize(
        (1, H), Image.BICUBIC
    )
    arr = np.asarray(image, dtype=np.float32).reshape(H, 1) / 255.0
    if blur:
        arr = (
            np.asarray(
                Image.fromarray((arr * 255).astype(np.uint8)).filter(
                    ImageFilter.GaussianBlur(blur)
                ),
                dtype=np.float32,
            ).reshape(H, 1)
            / 255.0
        )
    return arr - 0.5


streak = noise_field(30)
fine = noise_field(160)
grain = noise_field(520)
billow = noise_field(6)
billow2 = noise_field(15)
noise = 0.26 * streak + 0.36 * fine + 0.38 * grain

# The inner edge sits around 72% of the texture so two mirrored banks overlap
# just past the centre of the stage when they meet.
edge = (
    0.72
    + contour(6, 4) * 0.012
    + contour(17, 2) * 0.005
    + contour(61, 0) * 0.003
)

y = np.linspace(0, 1, H)[:, None]
x = np.linspace(0, 1, W)[None, :]
distance = edge - x

core = 1 / (1 + np.exp(-distance / 0.02))
wispy = 1 / (1 + np.exp(-((distance + (noise - 0.5) * 0.15) / 0.035)))
wisps = (
    wispy
    * np.clip((fine - 0.2) * 1.7, 0, 1)
    * np.clip((streak - 0.08) * 1.4, 0, 1)
)
alpha = np.clip(core * (0.7 + 0.3 * noise) + wisps * 0.8, 0, 1)

# Large billows that spill past the edge, so the formation never reads as a
# straight sheet while it travels across the stage.
large = (
    np.clip((streak - 0.34) * 2.2, 0, 1)
    * np.exp(-(((x - edge - 0.05) / 0.075) ** 2))
)
alpha = np.clip(alpha + large * 0.45, 0, 1)

# Denser toward the outer edge, fading smoothly so the texture never shows a
# straight alpha seam.
alpha = np.clip(alpha + np.clip(1 - x / 0.4, 0, 1) * 0.06, 0, 1)

# Only the extreme top/bottom edges soften; the banks extend past the stage.
alpha *= np.clip(np.minimum(y / 0.04, (1 - y) / 0.04), 0, 1)

# Dark sand body, lit toward the moving inner edge.
tone = np.clip((x - (edge - 0.5)) / 0.5, 0, 1)
dark = np.array([22, 17, 9], dtype=np.float32)
mid = np.array([68, 53, 28], dtype=np.float32)
bright = np.array([136, 108, 60], dtype=np.float32)
low = dark[None, None, :] * (1 - tone[:, :, None]) + mid[None, None, :] * tone[:, :, None]
mix = np.clip(0.1 + 0.7 * tone, 0, 1)[:, :, None]
rgb = low * (1 - mix) + np.broadcast_to(bright[None, None, :], low.shape) * mix

# Billowing light and shadow keeps the body from reading as a flat gradient.
shade = 0.55 + 0.75 * billow + 0.2 * (billow2 - 0.5)
rgb *= shade[:, :, None]
rgb += (noise[:, :, None] - 0.5) * 42

cavity = np.clip((grain - 0.52) * 1.8, 0, 1) * np.clip(1.15 - billow * 0.6, 0, 1)
rgb *= 1 - cavity[:, :, None] * 0.55

# Streaming filaments and the bright edge that catches the light.
strand = (
    np.clip((fine - 0.6) * 3.2, 0, 1)
    * np.clip((streak - 0.18) * 1.9, 0, 1)
    * np.clip(1 - tone * 0.3, 0, 1)
)
rgb += strand[:, :, None] * 78
alpha = np.clip(alpha + strand * 0.22, 0, 1)

rim = (
    np.exp(-(((x - edge) / 0.028) ** 2))
    * np.clip(0.35 + 0.65 * fine, 0, 1)
    * (x < edge + 0.02)
)
rgb += rim[:, :, None] * np.array([210, 178, 116], dtype=np.float32)
alpha = np.clip(alpha + rim * 0.35, 0, 1)

# Fine glints across the body.
sparkle = (rng.random((H, W)) > 0.9987).astype(np.float32)
sparkle = (
    np.asarray(
        Image.fromarray((sparkle * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(0.45)
        ),
        dtype=np.float32,
    )
    / 255.0
)
rgb = np.clip(rgb + sparkle[:, :, None] * 120, 0, 255)
alpha = np.clip(alpha + sparkle * 0.4, 0, 1)

pixels = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
image = Image.fromarray(pixels, "RGBA").quantize(
    colors=48, method=Image.FASTOCTREE
)

os.makedirs(OUT, exist_ok=True)
path = os.path.join(OUT, "sand-wall.png")
image.save(path, "PNG", optimize=True)
print("sand-wall.png", image.size, round(os.path.getsize(path) / 1024), "KB")
