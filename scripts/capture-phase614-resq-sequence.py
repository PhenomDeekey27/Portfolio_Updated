"""Phase 6.14 — capture the optimised ResQ Wind Release sequence as timed frames.

Reloads the page, parks just above the wind stage so it arms on entry, then
samples the stage every ~160 ms so the cinematic order (atmosphere, gathering
currents, formation, vortex, core, directional wave, travel, title) can be
checked against the pre-optimisation frames.

Usage: python scripts/capture-phase614-resq-sequence.py [base_url]
"""

import asyncio
import os
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
OUT = "screenshots/phase614"
os.makedirs(OUT, exist_ok=True)

RUNS = [(1366, 768), (390, 844)]


async def wheel_until(page, js, tolerance=50, steps=200):
    for _ in range(steps):
        delta = await page.evaluate(js)
        if delta is None:
            return
        if abs(delta) <= tolerance:
            return
        await page.mouse.wheel(0, max(-900, min(900, delta)))
        await page.wait_for_timeout(70)
    await page.wait_for_timeout(600)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for w, h in RUNS:
            label = f"{w}x{h}"
            page = await browser.new_page(viewport={"width": w, "height": h})
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1000)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=1500)
                except Exception:
                    pass
            await page.wait_for_timeout(700)

            # Park just above the stage, then nudge it into view so the
            # observer arms the sequence at a known moment.
            await wheel_until(
                page,
                """() => {
                    const el = document.querySelector('[data-encounter="resq"]');
                    const stage = el ? el.querySelector('section') : null;
                    if (!stage) return null;
                    return stage.getBoundingClientRect().top - window.innerHeight * 1.05;
                }""",
            )
            await page.wait_for_timeout(400)
            await page.evaluate(
                """() => {
                    const el = document.querySelector('[data-encounter="resq"]');
                    const stage = el.querySelector('section');
                    const y = stage.getBoundingClientRect().top + window.scrollY - 40;
                    window.__savedY = window.scrollY;
                    window.scrollTo({ top: y, behavior: 'instant' });
                }"""
            )

            stage = page.locator('[data-encounter="resq"] section').first
            for i in range(10):
                await page.wait_for_timeout(160)
                active = await page.get_attribute('[data-encounter="resq"]', "data-active")
                await stage.screenshot(
                    path=f"{OUT}/resq-sequence-{label}-{i:02d}.png", timeout=60000
                )
                print(f"  {label} frame {i:02d} active={active}")
            await page.close()
        await browser.close()


asyncio.run(main())
