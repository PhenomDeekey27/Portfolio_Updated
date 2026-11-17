"""Phase 6.4 — Experience v2 -> v3 archive plate comparison.

The original compare harness recorded v1 vs v2. The interrupted session then
built and activated `career-archive-chamber-v3.webp`; this script records the
missing v2 -> v3 pair at the *same* crop, so only the plate changes.

Captures the live section (v3, as shipped) and then re-applies v2 in the same
session with the identical computed background-position, so layout, fonts and
scroll position match. Writes frames + side-by-side pairs to
screenshots/phase64/compare/ and a small report.json.

Usage: python scripts/capture-experience-v3-compare.py [base_url]
"""

import asyncio
import json
import os
import sys

from PIL import Image, ImageDraw
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "BASE", "http://localhost:3001"
)
OUT = "screenshots/phase64/compare"
VIEWPORTS = [("1366x768", 1366, 768), ("390x844", 390, 844)]


async def open_page(browser, w, h):
    context = await browser.new_context(viewport={"width": w, "height": h})
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
    return context, page


async def scroll_to_experience(page):
    top = await page.evaluate(
        "() => document.getElementById('experience').getBoundingClientRect().top + window.scrollY"
    )
    await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", top)
    await page.wait_for_timeout(900)


def pair(before, after, out_name, target_h=720, gap=16, label_h=34):
    def fit(im, height):
        return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)

    a = fit(Image.open(before).convert("RGB"), target_h)
    b = fit(Image.open(after).convert("RGB"), target_h)
    canvas = Image.new("RGB", (a.width + b.width + gap, target_h + label_h), (9, 10, 9))
    canvas.paste(a, (0, label_h))
    canvas.paste(b, (a.width + gap, label_h))
    d = ImageDraw.Draw(canvas)
    d.text((12, 9), "BEFORE — v2 plate", fill=(200, 180, 140))
    d.text((a.width + gap + 12, 9), "AFTER — v3 plate (active)", fill=(200, 180, 140))
    canvas.save(os.path.join(OUT, out_name))
    print(out_name, canvas.size)


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"base": BASE, "viewports": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for label, w, h in VIEWPORTS:
            context, page = await open_page(browser, w, h)
            await scroll_to_experience(page)

            active = await page.evaluate(
                """() => {
                  const l = document.querySelector('.exp-archive-image');
                  const cs = getComputedStyle(l);
                  return { bg: cs.backgroundImage, pos: cs.backgroundPosition,
                           size: cs.backgroundSize, opacity: cs.opacity };
                }"""
            )
            after = os.path.join(OUT, f"experience-v3-{label}-after.png")
            await page.screenshot(path=after)

            await page.evaluate(
                """async () => {
                  const l = document.querySelector('.exp-archive-image');
                  const pos = getComputedStyle(l).backgroundPosition;
                  const url = '/assets/experience/career-archive-chamber-v2.webp';
                  await new Promise((res) => {
                    const img = new Image();
                    img.onload = res;
                    img.onerror = res;
                    img.src = url;
                  });
                  l.style.backgroundImage = `url("${url}")`;
                  l.style.backgroundPosition = pos;
                  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                }"""
            )
            await page.wait_for_timeout(700)
            before = os.path.join(OUT, f"experience-v3-{label}-before.png")
            await page.screenshot(path=before)

            injected = await page.evaluate(
                """() => {
                  const cs = getComputedStyle(document.querySelector('.exp-archive-image'));
                  return { bg: cs.backgroundImage, pos: cs.backgroundPosition };
                }"""
            )

            report["viewports"].append(
                {"viewport": label, "size": [w, h], "active": active, "injected": injected}
            )
            pair(
                before,
                after,
                f"experience-v3-{label}-before-after.png",
                target_h=760 if w < 1024 else 700,
            )
            await context.close()

        await browser.close()

    with open(os.path.join(OUT, "experience-v3-report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))


asyncio.run(main())
