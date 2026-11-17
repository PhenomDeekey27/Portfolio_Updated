"""Quick single-viewport Experience plate check (Phase 6.4 iteration helper).

Usage: python scripts/capture-exp-quick.py [width] [height] [position] [out]
Captures the live section at the section top plus a content-hidden plate.
"""

import asyncio
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

W = int(sys.argv[1]) if len(sys.argv) > 1 else 1920
H = int(sys.argv[2]) if len(sys.argv) > 2 else 1080
POS = sys.argv[3] if len(sys.argv) > 3 else None
OUT = sys.argv[4] if len(sys.argv) > 4 else f"screenshots/phase64/exp-v3-live-{W}.png"


async def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": W, "height": H})
        page = await ctx.new_page()
        await page.goto("http://localhost:3001", wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1200)
        top = await page.evaluate(
            "() => document.getElementById('experience').getBoundingClientRect().top + window.scrollY"
        )
        await page.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", top)
        await page.wait_for_timeout(900)
        if POS:
            await page.evaluate(
                "(pos) => { const l = document.querySelector('.exp-archive-image'); if (l) l.style.backgroundPosition = pos; }",
                POS,
            )
            await page.wait_for_timeout(400)
        bg = await page.evaluate(
            "() => { const l = document.querySelector('.exp-archive-image'); return l ? getComputedStyle(l).backgroundImage : null; }"
        )
        print("bg:", bg)
        await page.screenshot(path=OUT)
        await browser.close()

    with Image.open(OUT) as im:
        gray = im.convert("L")
        # central copy band, excluding the rail
        crop = gray.crop((int(W * 0.38), int(H * 0.1), int(W * 0.9), int(H * 0.9)))
        hist = crop.histogram()
        total = sum(hist)
        mean = sum(i * n for i, n in enumerate(hist)) / total
        cumulative = 0
        p95 = 255
        for i, n in enumerate(hist):
            cumulative += n
            if cumulative >= total * 0.95:
                p95 = i
                break
        print(f"{OUT}: copy band mean {mean:.1f} p95 {p95}")


asyncio.run(main())
