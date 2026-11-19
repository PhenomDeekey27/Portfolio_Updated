"""Verify the desktop hero copy now appears with the world, not ~7s later."""
import asyncio
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")

JS = """() => {
  const intro = document.querySelector('#home p.text-base');
  const letter = document.querySelector('#home h1 span span');
  const loader = document.querySelector('[data-raijin-loader]');
  return {
    t: performance.now(),
    intro: Number(getComputedStyle(intro).opacity),
    letter: Number(getComputedStyle(letter).opacity),
    loader: Number(getComputedStyle(loader).opacity),
  };
}"""


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        loader_hidden = None
        first_letter = None
        intro_visible = None
        t0 = None
        for _ in range(400):
            st = await page.evaluate(JS)
            if t0 is None:
                t0 = st["t"]
            elapsed = st["t"] - t0
            if loader_hidden is None and st["loader"] < 0.05:
                loader_hidden = round(elapsed)
            if first_letter is None and st["letter"] > 0.5:
                first_letter = round(elapsed)
            if intro_visible is None and st["intro"] > 0.5:
                intro_visible = round(elapsed)
            if loader_hidden is not None and intro_visible is not None:
                break
            await page.wait_for_timeout(50)

        gap = None if loader_hidden is None or intro_visible is None else intro_visible - loader_hidden
        print(
            {
                "loaderHiddenMs": loader_hidden,
                "firstLetterVisibleMs": first_letter,
                "introVisibleMs": intro_visible,
                "introAfterLoaderMs": gap,
            }
        )
        await browser.close()
        if gap is None or gap > 1500:
            raise SystemExit("hero copy still lags the loader")


asyncio.run(main())
