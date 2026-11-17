"""Build labelled before/after composites for the Phase 6.4 report."""

import os

from PIL import Image, ImageDraw

SRC = "screenshots/phase64"
OUT = os.path.join(SRC, "compare")


def load(path):
    im = Image.open(path).convert("RGB")
    return im


def fit(im, height):
    w = round(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)


def pair(before, after, out_name, target_h=700, gap=16, label_h=34):
    a = fit(load(before), target_h)
    b = fit(load(after), target_h)
    canvas = Image.new(
        "RGB", (a.width + b.width + gap, target_h + label_h), (9, 10, 9)
    )
    canvas.paste(a, (0, label_h))
    canvas.paste(b, (a.width + gap, label_h))
    d = ImageDraw.Draw(canvas)
    d.text((12, 9), "BEFORE", fill=(200, 180, 140))
    d.text((a.width + gap + 12, 9), "AFTER", fill=(200, 180, 140))
    canvas.save(os.path.join(OUT, out_name))
    print(out_name, canvas.size)


def stack(before, after, out_name, width=1366, gap=14, label_h=30):
    a = load(before).resize((width, round(load(before).height * width / load(before).width)), Image.LANCZOS)
    b = load(after).resize((width, round(load(after).height * width / load(after).width)), Image.LANCZOS)
    canvas = Image.new("RGB", (width, a.height + b.height + gap), (9, 10, 9))
    canvas.paste(a, (0, 0))
    canvas.paste(b, (0, a.height + gap))
    d = ImageDraw.Draw(canvas)
    d.text((10, 6), "BEFORE", fill=(230, 210, 170))
    d.text((10, a.height + gap + 6), "AFTER", fill=(230, 210, 170))
    canvas.save(os.path.join(OUT, out_name))
    print(out_name, canvas.size)


pair(
    f"{SRC}/kunai/kunai-detail.png",
    f"{SRC}/kunai2/loader-260-zoom.png",
    "kunai-before-after.png",
    target_h=660,
)
pair(
    f"{OUT}/experience-390x844-before.png",
    f"{OUT}/experience-390x844-after.png",
    "experience-mobile-before-after.png",
    target_h=760,
)
pair(
    f"{OUT}/missions-390x844-before.png",
    f"{OUT}/missions-390x844-after.png",
    "missions-mobile-before-after.png",
    target_h=760,
)
stack(
    f"{OUT}/experience-1366x768-before.png",
    f"{OUT}/experience-1366x768-after.png",
    "experience-desktop-before-after.png",
)
