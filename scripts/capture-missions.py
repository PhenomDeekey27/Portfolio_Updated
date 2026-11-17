"""Phase 6.2 — visual inspection of the Missions archive.

Captures the section at the top, middle and end of its scroll range, records the
background that is actually rendered, and probes overflow / reduced-motion.

Usage: python scripts/capture-missions.py <label> <width> <height>
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "desktop"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1920
H = int(sys.argv[3]) if len(sys.argv) > 3 else 1080
OUT = f"screenshots/phase62/{LABEL}"

STATE_JS = """() => {
  const section = document.getElementById('missions');
  const world = document.querySelector('[data-missions-world]');
  const layer = world ? world.querySelector('div[style*="background-image"]') : null;
  const featured = section.querySelector('article');
  return {
    y: Math.round(window.scrollY),
    sectionHeight: section ? Math.round(section.getBoundingClientRect().height) : null,
    sectionTop: section ? Math.round(section.getBoundingClientRect().top) : null,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    worldPresent: !!world,
    backgroundImage: layer ? getComputedStyle(layer).backgroundImage : null,
    backgroundSize: layer ? getComputedStyle(layer).backgroundSize : null,
    backgroundPosition: layer ? getComputedStyle(layer).backgroundPosition : null,
    featuredWidth: featured ? Math.round(featured.getBoundingClientRect().width) : null,
    dossiers: section.querySelectorAll('article').length,
    archiveEntries: section.querySelectorAll('a[href^="http"]').length,
    phase: document.querySelector('[data-section-content="missions"]')?.getAttribute('data-reveal-phase'),
  };
}"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"label": LABEL, "viewport": [W, H], "shots": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def open_page(reduced=False):
            context = await browser.new_context(
                viewport={"width": W, "height": H},
                reduced_motion="reduce" if reduced else "no-preference",
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
            await page.wait_for_timeout(1200)
            return context, page

        async def scroll_to(page, target_y):
            await page.evaluate(
                "(y) => window.scrollTo({ top: y, behavior: 'instant' })", target_y
            )
            await page.wait_for_timeout(1100)

        context, page = await open_page()
        top = await page.evaluate(
            "() => document.getElementById('missions').getBoundingClientRect().top + window.scrollY"
        )
        height = await page.evaluate(
            "() => document.getElementById('missions').getBoundingClientRect().height"
        )
        report["section"] = {"top": round(top), "height": round(height), "viewport": [W, H]}

        for name, fraction in [("01-top", 0.0), ("02-mid", 0.42), ("03-end", 0.92)]:
            await scroll_to(page, round(top + (height - H) * fraction))
            state = await page.evaluate(STATE_JS)
            report["shots"].append({"name": name, **state})
            await page.screenshot(path=f"{OUT}/{name}.png")

        # Background only, at full viewport, for quality comparison.
        await scroll_to(page, round(top + 40))
        await page.evaluate(
            "() => document.querySelectorAll('[data-missions-world]').forEach(el => el.style.visibility='visible')"
        )
        await page.screenshot(path=f"{OUT}/05-background.png")

        await page.locator("#missions").screenshot(path=f"{OUT}/00-section.png")
        await context.close()

        context, page = await open_page(reduced=True)
        await scroll_to(page, round(top + 120))
        report["reducedMotion"] = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/04-reduced-motion.png")
        await context.close()

        await browser.close()

    with open(f"{OUT}/report.json", "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))


asyncio.run(main())
