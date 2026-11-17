"""Phase 6.4 — before/after evidence for the shipped visual changes.

Captures the live page at the review viewports, then re-applies the previous
asset/crop in the same session (Experience v1 + portrait 66%; Missions portrait
70% without the top scrim) so before/after frames share layout, fonts and scroll
position. Writes pairs to screenshots/phase64/compare/.

Usage: python scripts/capture-phase64-compare.py [base_url]
"""

import asyncio
import os
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BASE", "http://localhost:3001")
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


async def scroll_section(page, section_id):
    top = await page.evaluate(
        "(id) => document.getElementById(id).getBoundingClientRect().top + window.scrollY",
        section_id,
    )
    await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", top)
    await page.wait_for_timeout(900)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for label, w, h in VIEWPORTS:
            context, page = await open_page(browser, w, h)

            # --- Experience -------------------------------------------------
            await scroll_section(page, "experience")
            await page.screenshot(path=os.path.join(OUT, f"experience-{label}-after.png"))
            await page.evaluate(
                """(mobile) => {
                  const l = document.querySelector('.exp-archive-image');
                  l.style.backgroundImage = 'url("/assets/experience/career-archive-chamber.webp")';
                  l.style.backgroundPosition = mobile ? '66% 46%' : '50% 46%';
                }""",
                w < 1024,
            )
            await page.wait_for_timeout(700)
            await page.screenshot(path=os.path.join(OUT, f"experience-{label}-before.png"))

            # --- Missions (portrait only; the desktop crop is unchanged) -----
            if w < 1024:
                await scroll_section(page, "missions")
                await page.screenshot(path=os.path.join(OUT, f"missions-{label}-after.png"))
                await page.evaluate(
                    """() => {
                      const layer = document.querySelector('[data-missions-world] div[style*="background-image"]');
                      if (layer) layer.style.backgroundPosition = '70% center';
                      const scrim = document.querySelector('[data-missions-top-scrim]');
                      if (scrim) scrim.style.display = 'none';
                    }"""
                )
                await page.wait_for_timeout(700)
                await page.screenshot(path=os.path.join(OUT, f"missions-{label}-before.png"))

            await context.close()

        await browser.close()
    print("wrote", OUT)


asyncio.run(main())
