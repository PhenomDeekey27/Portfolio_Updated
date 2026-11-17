"""Capture the real BugWiser application screens used by the portfolio gallery.

The deployed build (https://bug-wiser.vercel.app/) defaults to its light theme.
The portfolio chapter is charcoal and gold, so every screen is captured in the
application's own dark theme, switched with its own "Toggle theme" control. No
interface is recreated: these are viewport captures of the live build.

Output (public/assets/missions/bugwiser/):
  screen-overview.png            1440x900  hero + GitHub entry point
  screen-workflow.png            1440x900  six-step investigation workflow
  screen-investigation.png       1440x900  investigation workspace, root cause,
                                            code evidence and patch preview
  screen-overview-mobile.png     390x844
  screen-workflow-mobile.png     390x844
  screen-investigation-mobile.png
                                 390x844

Usage: python scripts/capture-bugwiser-screens.py
"""

import asyncio
import os

from playwright.async_api import async_playwright

BASE = "https://bug-wiser.vercel.app/"
OUT = os.path.join("public", "assets", "missions", "bugwiser")

DESKTOP = [
    ("screen-overview.png", 1440, 900, 0),
    ("screen-workflow.png", 1440, 900, 632),
    ("screen-investigation.png", 1440, 900, 1327),
]

MOBILE = [
    ("screen-overview-mobile.png", 390, 844, 0),
    ("screen-workflow-mobile.png", 390, 844, 645),
    ("screen-investigation-mobile.png", 390, 844, 1620),
]


async def capture(browser, filename, width, height, scroll_y):
    page = await browser.new_page(
        viewport={"width": width, "height": height}, device_scale_factor=2
    )
    await page.goto(BASE, wait_until="networkidle", timeout=90000)
    await page.wait_for_timeout(1200)
    await page.get_by_role("button", name="Toggle theme").click()
    await page.wait_for_timeout(900)
    await page.evaluate(
        "(y) => window.scrollTo({ top: y, behavior: 'instant' })", scroll_y
    )
    await page.wait_for_timeout(700)
    await page.screenshot(path=os.path.join(OUT, filename))
    size = await page.evaluate(
        "() => [window.scrollX, window.scrollY, document.documentElement.scrollWidth, document.documentElement.scrollHeight]"
    )
    print(filename, width, height, "scroll", size)
    await page.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for row in DESKTOP + MOBILE:
            await capture(browser, *row)
        await browser.close()


asyncio.run(main())
