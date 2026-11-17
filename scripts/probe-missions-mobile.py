"""Phase 6.4 — probe the Missions portrait crop with an extra top scrim.

Temporarily applies candidate background positions and a mobile-only top
gradient, then measures heading/intro contrast and saves content shots. Nothing
is written to application code.

Usage: python scripts/probe-missions-mobile.py [base_url]
Output: screenshots/phase64/missions-probe/*.png, report.json
"""

import asyncio
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase64/missions-probe"
W, H = 390, 844

def top_scrim(alpha):
    return (
        "linear-gradient(to bottom, "
        f"rgba(6,7,6,{alpha}) 0%, "
        f"rgba(6,7,6,{alpha * 0.72}) 26%, "
        f"rgba(6,7,6,{alpha * 0.3}) 44%, transparent 60%)"
    )


# position, extra top-scrim CSS (None = current production scrim)
CANDIDATES = [
    ("70-current", "70% center", None),
    ("74-a30", "74% center", top_scrim(0.30)),
    ("74-a40", "74% center", top_scrim(0.40)),
    (
        "74-band",
        "74% center",
        "linear-gradient(to bottom, rgba(6,7,6,0.10) 0%, "
        "rgba(6,7,6,0.34) 15%, rgba(6,7,6,0.34) 33%, "
        "rgba(6,7,6,0.12) 42%, transparent 54%)",
    ),
    (
        "74-band2",
        "74% center",
        "linear-gradient(to bottom, rgba(6,7,6,0.14) 0%, "
        "rgba(6,7,6,0.42) 14%, rgba(6,7,6,0.42) 34%, "
        "rgba(6,7,6,0.14) 43%, transparent 56%)",
    ),
]

TEXT_COLORS = {"heading": (0xED, 0xE7, 0xDA), "intro": (0xA3, 0x9D, 0x91)}

BOXES_JS = """() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const c = document.querySelector('[data-section-content="missions"]');
  return {
    heading: c ? box(c.querySelector('h2')) : null,
    intro: c ? box([...c.querySelectorAll('p')].find((p) => p.textContent.includes('Open-source tools'))) : null,
  };
}"""


def _linear(channel):
    c = channel / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb):
    r, g, b = (_linear(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return round((hi + 0.05) / (lo + 0.05), 2)


def text_contrast(path, boxes):
    out = {}
    with Image.open(path) as im:
        rgb = im.convert("RGB")
        for label, color in TEXT_COLORS.items():
            box = boxes.get(label)
            if not box or box["w"] <= 0:
                continue
            crop = rgb.crop((box["x"], box["y"], box["x"] + box["w"], box["y"] + box["h"]))
            lums = sorted(relative_luminance(p) for p in crop.getdata())
            n = len(lums)
            tl = relative_luminance(color)
            out[label] = {
                "mean": contrast_ratio(tl, sum(lums) / n),
                "p95": contrast_ratio(tl, lums[min(n - 1, int(n * 0.95))]),
            }
    return out


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"base": BASE, "viewport": [W, H], "candidates": []}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": W, "height": H})
        page = await context.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1000)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1400)
        top = await page.evaluate(
            "() => document.getElementById('missions').getBoundingClientRect().top + window.scrollY"
        )
        await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", top)
        await page.wait_for_timeout(900)
        boxes = await page.evaluate(BOXES_JS)
        report["boxes"] = boxes

        await page.evaluate(
            """() => {
              const world = document.querySelector('[data-missions-world] .sticky');
              const scrim = document.createElement('div');
              scrim.id = 'probe-scrim';
              scrim.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
              world.appendChild(scrim);
            }"""
        )

        for name, pos, scrim_css in CANDIDATES:
            await page.evaluate(
                "(pos) => { const l = document.querySelector('[data-missions-world] div[style*=\"background-image\"]'); if (l) l.style.backgroundPosition = pos; }",
                pos,
            )
            await page.evaluate(
                "(css) => { const s = document.getElementById('probe-scrim');"
                " s.style.background = css || 'none'; }",
                scrim_css,
            )
            await page.wait_for_timeout(400)
            path = os.path.join(OUT, f"{name}.png")
            await page.screenshot(path=path)
            # Measure against the plate, not the rendered text itself.
            await page.evaluate(
                "() => { const c = document.querySelector('[data-section-content=\"missions\"]');"
                " if (c) c.style.visibility = 'hidden'; }"
            )
            await page.wait_for_timeout(250)
            plate_path = os.path.join(OUT, f"{name}-plate.png")
            await page.screenshot(path=plate_path)
            await page.evaluate(
                "() => { const c = document.querySelector('[data-section-content=\"missions\"]');"
                " if (c) c.style.visibility = 'visible'; }"
            )
            report["candidates"].append(
                {"name": name, "position": pos, "extraScrim": scrim_css, "contrast": text_contrast(plate_path, boxes)}
            )

        await context.close()
        await browser.close()

    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))


asyncio.run(main())
