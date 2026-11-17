"""
PHASE 6.15 — wind sequence stills, keyed to replay time.

Restarts the ResQ timeline and captures the stage at fixed offsets so the six
beats (gathering currents, formation, core igniting, release wave, RESQ reveal)
can be compared frame for frame against the previous phase.

    python scripts/shoot-phase615-wind.py --width 1366 --height 768 --tag desktop
"""

import argparse
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
BEATS = [(400, "01-gather"), (1100, "02-currents"), (1800, "03-form"), (2500, "04-impulse"),
         (3100, "05-release"), (4600, "06-settled")]

REPLAY = """async () => {
  const a = document.querySelector('[data-jutsu="wind"]');
  a.setAttribute('data-active', 'false');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  a.setAttribute('data-active', 'true');
}"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=1366)
    ap.add_argument("--height", type=int, default=768)
    ap.add_argument("--tag", default="desktop")
    args = ap.parse_args()

    out = Path("screenshots/phase615")
    out.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": args.width, "height": args.height})
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(800)

        await page.evaluate(
            """() => {
              const el = document.querySelector('[data-jutsu="wind"] .wnd-stage');
              const y = el.getBoundingClientRect().top + window.scrollY;
              window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
            }"""
        )
        await page.wait_for_timeout(6000)

        await page.evaluate(REPLAY)
        start = 0
        for at, name in BEATS:
            await page.wait_for_timeout(at - start)
            start = at
            await page.screenshot(
                path=str(out / f"wind-{args.tag}-{name}.png"), animations="allow"
            )
            print(f"  {name} @ {at} ms")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
