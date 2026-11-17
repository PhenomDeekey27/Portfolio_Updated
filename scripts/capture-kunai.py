"""Phase 6.4 — inspect the rebuilt Flying Raijin kunai in situ.

Captures the boot loader and the Home -> About transition over time, plus a
2x zoom crop of the weapon so the metal shading can be judged at real size.

Usage: python scripts/capture-kunai.py [base_url]
Output: screenshots/phase64/kunai2/
"""

import asyncio
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase64/kunai2"


def crop_center(path, name, box=520):
    with Image.open(path) as im:
        w, h = im.size
        cx, cy = w // 2, int(h * 0.46)
        left = max(0, cx - box // 2)
        top = max(0, cy - box // 2)
        im.crop((left, top, min(w, left + box), min(h, top + box))).resize(
            (box * 2, box * 2), Image.LANCZOS
        ).save(os.path.join(OUT, name))


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # --- boot loader ---------------------------------------------------
        context = await browser.new_context(viewport={"width": 1366, "height": 768})
        page = await context.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        for ms in (120, 260, 450, 700):
            await page.wait_for_timeout(ms if ms == 120 else 180)
            path = os.path.join(OUT, f"loader-{ms}.png")
            await page.screenshot(path=path)
            crop_center(path, f"loader-{ms}-zoom.png", 420)
        await context.close()

        # --- transition ----------------------------------------------------
        context = await browser.new_context(viewport={"width": 1366, "height": 768})
        page = await context.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1600)

        frames = []
        triggered = False
        for _ in range(80):
            await page.mouse.wheel(0, 180)
            await page.wait_for_timeout(30)
            state = await page.evaluate(
                "() => document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null"
            )
            if state:
                triggered = True
                break
        if triggered:
            for i in range(26):
                await page.wait_for_timeout(25)
                path = os.path.join(OUT, f"transition-{i:02d}.png")
                await page.screenshot(path=path)
                frames.append(path)
            for i in (2, 5, 8, 11, 14, 17):
                if i < len(frames):
                    crop_center(frames[i], f"transition-{i:02d}-zoom.png", 420)
        print("triggered", triggered, "frames", len(frames))
        await context.close()
        await browser.close()


asyncio.run(main())
