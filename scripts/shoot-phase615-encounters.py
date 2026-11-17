"""
PHASE 6.15 — mobile composition captures for the four mission encounters.

Captures each encounter's opening beats at a phone viewport so the layout can be
inspected as a composition (column order, alignment, image placement), not just
checked for horizontal overflow.

    python scripts/shoot-phase615-encounters.py --width 320 --height 655 --tag m320
"""

import argparse
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
ARTICLES = ["bugwiser", "resq", "enn-consultancy", "saravaraj-ai"]


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=844)
    ap.add_argument("--tag", default="m390")
    ap.add_argument("--beats", type=int, default=3)
    args = ap.parse_args()

    out = Path("screenshots/phase615")
    out.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": args.width, "height": args.height}, device_scale_factor=2
        )
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(800)

        for y in range(0, 36000, 500):
            await page.evaluate("(y)=>{window.__lenis?window.__lenis.scrollTo(y,{immediate:true}):scrollTo(0,y)}", y)
            await page.wait_for_timeout(25)
        await page.wait_for_timeout(900)

        overflow = await page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        print(f"viewport {args.width}x{args.height}  horizontal overflow: {overflow}px")

        for mission in ARTICLES:
            sel = f'[data-encounter="{mission}"]'
            count = await page.locator(sel).count()
            if not count:
                print(f"  {mission}: not rendered")
                continue
            top = await page.evaluate(
                """(sel) => {
                  const el = document.querySelector(sel);
                  return el.getBoundingClientRect().top + window.scrollY;
                }""",
                sel,
            )
            shots = 0
            for beat in range(args.beats):
                y = top + beat * (args.height - 60)
                await page.evaluate(
                    """(y) => { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y); }""",
                    y,
                )
                await page.wait_for_timeout(1400)
                name = f"enc-{args.tag}-{mission}-{beat + 1}.png"
                await page.screenshot(path=str(out / name), animations="disabled")
                print(f"  {name}")
                shots += 1
            if not shots:
                print(f"  {mission}: no captures")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
