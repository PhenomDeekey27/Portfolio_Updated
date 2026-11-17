"""Isolated probe: backward -> home transition on a production server.

The full verification drive reports "transition never started" for the final
backward -> home route on `next start` builds (also on an older Nov 10 build),
while dev runs pass it. This probe reproduces only that route from a clean
load so the failure can be attributed to the app or to the long-session drive.

Usage: BASE=http://localhost:3001 python scripts/probe-backward-home.py
"""

import asyncio
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase64/prod-probe"

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  const about = document.getElementById('about');
  const home = document.getElementById('home');
  return {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    y: Math.round(window.scrollY),
    aboutTop: about ? Math.round(about.getBoundingClientRect().top) : null,
    homeBottom: home ? Math.round(home.getBoundingClientRect().bottom) : null,
    aboutPhase: (() => {
      const el = document.querySelector('[data-section-content]');
      return el ? el.getAttribute('data-reveal-phase') : null;
    })(),
  };
}"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1200)

        # Drive forward to about once, so the page sits where a real visitor
        # who scrolled down would be.
        for _ in range(60):
            await page.mouse.wheel(0, 180)
            await page.wait_for_timeout(35)
            st = await page.evaluate(STATE_JS)
            if st["state"]:
                break
        for _ in range(60):
            st = await page.evaluate(STATE_JS)
            if st["state"] is None:
                break
            await page.wait_for_timeout(50)
        await page.wait_for_timeout(900)
        start = await page.evaluate(STATE_JS)
        print("before backward:", start)

        seen = []
        for i in range(60):
            await page.mouse.wheel(0, -180)
            await page.wait_for_timeout(35)
            st = await page.evaluate(STATE_JS)
            if st["state"] and st["state"] not in seen:
                seen.append(st["state"])
                await page.screenshot(path=f"{OUT}/backward-home-{st['state']}.png")
            if i < 8:
                print(f"  wheel {i}: y={st['y']} state={st['state']} aboutTop={st['aboutTop']} homeBottom={st['homeBottom']}")
            if st["state"] is None and seen:
                break

        await page.wait_for_timeout(700)
        final = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/backward-home-settled.png")
        print("states seen:", seen)
        print("final:", final)
        print("RESULT:", "PASS" if seen else "FAIL (transition never started)")
        await browser.close()


asyncio.run(main())
