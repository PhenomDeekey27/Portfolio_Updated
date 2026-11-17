"""Phase 6.4 — Experience archive background validation.

Captures the real Career Ledger over the active archive chamber at the three
review viewports, with and without content (plate), and measures background
luminance + WCAG contrast for the actual text colours. Also sweeps portrait
background positions so the mobile crop can be chosen deliberately.

Usage: python scripts/capture-experience-bg.py [base_url]
Output: screenshots/phase64/experience/<viewport>/*.png, report.json
"""

import asyncio
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "BASE", "http://localhost:3001"
)
OUT = "screenshots/phase64/experience"
VIEWPORTS = [("1920x1080", 1920, 1080), ("1366x768", 1366, 768), ("390x844", 390, 844)]
POSITIONS = {
    "1920x1080": ["50% 46%"],
    "1366x768": ["50% 46%"],
    "390x844": [
        "50% 46%",
        "66% 46%",
        "70% 46%",
        "74% 46%",
        "78% 46%",
        "82% 46%",
        "86% 46%",
    ],
}

TEXT_COLORS = {
    "bone": (0xED, 0xE7, 0xDA),
    "ash": (0xA3, 0x9D, 0x91),
    "goldsoft": (0xE6, 0xC9, 0x95),
}

BOXES_JS = """() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const c = document.querySelector('[data-section-content="experience"]');
  const heading = c ? c.querySelector('h2') : null;
  const intro = c
    ? [...c.querySelectorAll('p')].find((p) => p.textContent.includes('From frontend internships'))
    : null;
  const firstRecord = c ? c.querySelector('li[data-chapter-index]') : null;
  const company = firstRecord ? firstRecord.querySelector('h3') : null;
  const body = firstRecord ? firstRecord.querySelector('li span:last-child') : null;
  return { heading: box(heading), intro: box(intro), company: box(company), body: box(body) };
}"""


def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lum(rgb):
    r, g, b = (lin(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return round((hi + 0.05) / (lo + 0.05), 2)


def metrics(path, boxes):
    out = {}
    with Image.open(path) as im:
        rgb = im.convert("RGB")
        for name, box in boxes.items():
            if not box:
                continue
            crop = rgb.crop((box["x"], box["y"], box["x"] + box["w"], box["y"] + box["h"]))
            lums = sorted(lum(p) for p in crop.getdata())
            n = len(lums)
            mean = sum(lums) / n
            p95 = lums[min(n - 1, int(n * 0.95))]
            out[name] = {
                "meanLuma": round(mean * 255, 1),
                "p95Luma": round(p95 * 255, 1),
                "contrastMean": {k: ratio(lum(c), mean) for k, c in TEXT_COLORS.items()},
                "contrastP95": {k: ratio(lum(c), p95) for k, c in TEXT_COLORS.items()},
            }
    return out


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"viewport": {}, "base": BASE}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for label, w, h in VIEWPORTS:
            vdir = os.path.join(OUT, label)
            os.makedirs(vdir, exist_ok=True)
            context = await browser.new_context(
                viewport={"width": w, "height": h}, reduced_motion="no-preference"
            )
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
                "() => document.getElementById('experience').getBoundingClientRect().top + window.scrollY"
            )
            height = await page.evaluate(
                "() => document.getElementById('experience').getBoundingClientRect().height"
            )

            rec = {"size": [w, h], "sectionHeight": round(height), "shots": [], "plates": []}

            async def scroll(y):
                await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", y)
                await page.wait_for_timeout(900)

            for name, frac in [("top", 0.0), ("mid", 0.42), ("end", 0.9)]:
                await scroll(round(top + (height - h) * frac))
                shot = os.path.join(vdir, f"{name}.png")
                await page.screenshot(path=shot)
                rec["shots"].append(
                    {
                        "name": name,
                        "overflowX": await page.evaluate(
                            "() => document.documentElement.scrollWidth - window.innerWidth"
                        ),
                        "active": await page.evaluate(
                            "() => document.querySelector('[data-chapter-index][data-active=\"true\"]')?.dataset.chapterIndex ?? null"
                        ),
                    }
                )

            # Hide content and measure the plate.
            await scroll(round(top))
            boxes = await page.evaluate(BOXES_JS)
            await page.evaluate(
                "() => { const c = document.querySelector('[data-section-content=\"experience\"]');"
                " if (c) c.style.visibility = 'hidden'; }"
            )
            for pos in POSITIONS[label]:
                await page.evaluate(
                    "(pos) => { const l = document.querySelector('.exp-archive-image'); if (l) l.style.backgroundPosition = pos; }",
                    pos,
                )
                await page.wait_for_timeout(350)
                tag = pos.split()[0].replace("%", "")
                plate = os.path.join(vdir, f"plate-pos-{tag}.png")
                await page.screenshot(path=plate)
                rec["plates"].append(
                    {
                        "position": pos,
                        "metrics": metrics(plate, boxes),
                        "bg": await page.evaluate(
                            "() => { const l = document.querySelector('.exp-archive-image');"
                            " return l ? getComputedStyle(l).backgroundImage : null; }"
                        ),
                    }
                )

            await page.evaluate(
                "() => { const c = document.querySelector('[data-section-content=\"experience\"]');"
                " if (c) c.style.visibility = 'visible'; }"
            )
            rec["boxes"] = boxes
            await context.close()

            # Reduced-motion sanity shot.
            context = await browser.new_context(
                viewport={"width": w, "height": h}, reduced_motion="reduce"
            )
            page = await context.new_page()
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1200)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=2000)
                except Exception:
                    pass
            await page.wait_for_timeout(800)
            top = await page.evaluate(
                "() => document.getElementById('experience').getBoundingClientRect().top + window.scrollY"
            )
            await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", top)
            await page.wait_for_timeout(600)
            await page.screenshot(path=os.path.join(vdir, "reduced-motion.png"))
            await context.close()

            report["viewport"][label] = rec

        await browser.close()

    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: {"shots": v["shots"], "plates": v["plates"]} for k, v in report["viewport"].items()}, indent=2))


asyncio.run(main())
