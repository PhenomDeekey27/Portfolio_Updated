"""Capture the Jutsu Encounter Archive (Missions showcase).

Scrolls to each encounter, waits for its one-shot treatment to finish, then
records the viewport and the stage plate. Also captures the Field Archive and
a downscaled overview of the whole section.

Usage: BASE=http://localhost:3001 python scripts/capture-missions-showcase.py [label] [w] [h]
"""

import asyncio
import io
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "1366"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = f"screenshots/phase65/missions/{LABEL}"

ENCOUNTERS = ["bugwiser", "resq", "enn-consultancy", "saravaraj-ai"]


async def main():
    os.makedirs(OUT, exist_ok=True)
    notes = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass

        for index, enc in enumerate(ENCOUNTERS):
            await page.evaluate(
                """(id) => {
                  const el = document.querySelector(`[data-encounter="${id}"]`);
                  const y = el.getBoundingClientRect().top + window.scrollY - 84;
                  window.scrollTo({ top: y, behavior: 'instant' });
                }""",
                enc,
            )
            await page.wait_for_timeout(2400)
            active = await page.get_attribute(f'[data-encounter="{enc}"]', "data-active")
            notes.append({"encounter": enc, "dataActive": active})
            await page.screenshot(path=f"{OUT}/{index + 1:02d}-{enc}-viewport.png")
            frame = page.locator(f'[data-encounter="{enc}"] .enc-frame').first
            await frame.screenshot(path=f"{OUT}/{index + 1:02d}-{enc}-stage.png")

            # The record itself (title, description, stack, links).
            await page.evaluate(
                """(id) => {
                  const el = document.querySelector(`[data-encounter="${id}"] h3`);
                  const y = el.getBoundingClientRect().top + window.scrollY - 120;
                  window.scrollTo({ top: y, behavior: 'instant' });
                }""",
                enc,
            )
            await page.wait_for_timeout(1100)
            await page.screenshot(path=f"{OUT}/{index + 1:02d}-{enc}-record.png")

        # Field archive
        await page.evaluate(
            """() => {
              const el = document.querySelector('#missions h3');
              const nodes = [...document.querySelectorAll('#missions a[href]')];
              const last = nodes[nodes.length - 1];
              const y = last.getBoundingClientRect().top + window.scrollY - 260;
              window.scrollTo({ top: y, behavior: 'instant' });
            }"""
        )
        await page.wait_for_timeout(1600)
        await page.screenshot(path=f"{OUT}/05-field-archive.png")

        # Section overview (downscaled)
        shot = await page.locator("#missions").screenshot()
        im = Image.open(io.BytesIO(shot)).convert("RGB")
        width = 1100
        im.resize((width, round(im.height * width / im.width)), Image.LANCZOS).save(
            f"{OUT}/06-missions-overview.png"
        )

        overflow = await page.evaluate(
            "() => document.documentElement.scrollWidth - window.innerWidth"
        )
        notes.append({"overflowX": overflow})
        await browser.close()

    print(LABEL, notes)


asyncio.run(main())
