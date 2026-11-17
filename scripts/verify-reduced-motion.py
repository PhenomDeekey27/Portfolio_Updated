"""Phase 6.4 - reduced-motion audit for the three upgraded areas.

Checks in a real browser (prefers-reduced-motion: reduce) that:
  * the boot loader renders the kunai but never spins it,
  * the Home -> About transition falls back to a cut (no kunai stage),
  * the Experience archive layer adds no animation of its own.

Usage: python scripts/verify-reduced-motion.py [base_url]
"""

import asyncio
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 1366, "height": 768}, reduced_motion="reduce"
        )
        page = await ctx.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(600)

        loader = await page.evaluate(
            """() => {
              // The boot loader has no dedicated class: it is the fixed z-100
              // veil that renders the kunai and the progress bar.
              const root = [...document.querySelectorAll('div')].find(
                (el) =>
                  el.className.includes('z-[100]') &&
                  el.textContent.includes('Initializing the shinobi world')
              );
              const spin = root
                ? [...root.querySelectorAll('div')].find(
                    (el) => el.style.width === '96px' && el.style.height === '192px'
                  )
                : null;
              return {
                visible: root ? !root.className.includes('opacity-0') : false,
                root: root ? root.className : null,
                spin: spin ? spin.tagName : null,
                animationName: spin ? getComputedStyle(spin).animationName : null,
              };
            }"""
        )
        await page.screenshot(path="screenshots/phase64/reduced-motion-1366-loader.png")
        print("loader:", loader)

        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1200)

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
        strip = await page.evaluate(
            """() => ({
              state: document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null,
              kunai: !!document.querySelector('.fr-kunai'),
              kunaiWrap: !!document.querySelector('.fr-kunai-wrap'),
              particles: document.querySelectorAll('.fr-particle').length,
              flash: !!document.querySelector('.fr-flash'),
              veil: !!document.querySelector('.world-veil-raijin'),
            })"""
        )
        print("transition:", triggered, strip)

        await page.wait_for_timeout(1800)
        exp = await page.evaluate(
            """() => {
              const img = document.querySelector('.exp-archive-image');
              const layer = document.querySelector('.exp-archive');
              const read = (el) => (el ? {
                animationName: getComputedStyle(el).animationName,
                transitionDuration: getComputedStyle(el).transitionDuration,
                background: getComputedStyle(el).backgroundImage.slice(0, 90),
              } : null);
              return { image: read(img), layer: read(layer) };
            }"""
        )
        print("experience:", exp)
        await browser.close()


asyncio.run(main())
