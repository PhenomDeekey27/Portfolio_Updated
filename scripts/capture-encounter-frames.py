"""Capture the jutsu reveal choreography as timed frames.

For each encounter: reload the page, jump the encounter into view, then sample
the stage every ~130 ms so the treatment sequence (sand gather, lightning
charge, scroll unroll, network draw, title formation) is recorded.

Usage: BASE=http://localhost:3001 python scripts/capture-encounter-frames.py [label] [w] [h]
"""

import asyncio
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "1366"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = f"screenshots/phase65/frames/{LABEL}"

ENCOUNTERS = ["bugwiser", "resq", "enn-consultancy", "saravaraj-ai"]


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})

        for enc in ENCOUNTERS:
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(900)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=2000)
                except Exception:
                    pass
            await page.wait_for_timeout(600)

            # Park directly on the encounter, slightly above the stage so the
            # title and plate share the frame.
            await page.evaluate(
                """(id) => {
                  const el = document.querySelector(`[data-encounter="${id}"]`);
                  const y = el.getBoundingClientRect().top + window.scrollY - 70;
                  window.scrollTo({ top: y, behavior: 'instant' });
                }""",
                enc,
            )

            stage = page.locator(f'[data-encounter="{enc}"] .enc-frame').first
            states = []
            for i in range(9):
                await page.wait_for_timeout(150)
                active = await page.get_attribute(
                    f'[data-encounter="{enc}"]', "data-active"
                )
                await stage.screenshot(path=f"{OUT}/{enc}-{i:02d}.png")
                states.append(active)
            report.append({enc: states})
        await browser.close()
    print(LABEL, report)


asyncio.run(main())
