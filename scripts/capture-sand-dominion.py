"""Capture the Sand Dominion (BugWiser) sequence, desktop + mobile.

Stages captured, relative to the moment the encounter becomes active:
  120ms  character entrance
  650ms  seal / chakra gathering
 1000ms  sand activation
 1450ms  title wipe
 2050ms  application plate
 3400ms  settled scene

Usage: BASE=http://localhost:3001 python scripts/capture-sand-dominion.py
"""

import asyncio
import json
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase66/bugwiser"
VIEWPORTS = [("1920", 1920, 1080), ("1366", 1366, 768), ("390", 390, 844)]

STAGES = [
    ("00-entrance", 120),
    ("01-sign", 650),
    ("02-sand", 1000),
    ("03-title", 1450),
    ("04-plate", 2050),
    ("05-settled", 3400),
]


async def enter(page):
    await page.goto(BASE + "/", wait_until="domcontentloaded")
    await page.wait_for_timeout(900)
    skip = page.get_by_role("button", name="Skip intro")
    if await skip.count():
        await skip.first.click()
        await page.wait_for_timeout(500)
    # Park the scene in the reading band and let the world/phase settle.
    await page.evaluate(
        """() => {
            const el = document.querySelector('[data-encounter="bugwiser"]');
            const top = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: top - 30, behavior: 'instant' });
        }"""
    )
    # Wait for the encounter to be armed (phase content + intersection).
    try:
        await page.wait_for_function(
            """() => document.querySelector('[data-encounter="bugwiser"]')?.dataset.active === 'true'""",
            timeout=15000,
        )
    except Exception:
        pass
    await page.evaluate(
        "() => { const el = document.querySelector('[data-encounter=\"bugwiser\"]'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'instant' }); }"
    )


async def run(browser, label, width, height):
    page = await browser.new_page(viewport={"width": width, "height": height})
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await enter(page)
    started = await page.evaluate("() => performance.now()")
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)

    for name, at in STAGES:
        elapsed = await page.evaluate("() => performance.now()") - started
        wait = at - elapsed
        if wait > 0:
            await page.wait_for_timeout(wait)
        await page.screenshot(path=os.path.join(folder, f"scene-{name}.png"))

    # Settled viewport at the top of the encounter (what a visitor reads).
    await page.evaluate(
        "() => { const el = document.querySelector('[data-encounter=\"bugwiser\"]'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'instant' }); }"
    )
    await page.wait_for_timeout(900)
    await page.screenshot(path=os.path.join(folder, "viewport-settled.png"))

    if width < 1024:
        await page.evaluate(
            "() => { const el = document.querySelector('.sd-plate'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'instant' }); }"
        )
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(folder, "viewport-plate.png"))
        await page.evaluate(
            "() => { const el = document.querySelector('.sd-record'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' }); }"
        )
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(folder, "viewport-record.png"))

    # Reduced motion: settled state only, no sequence.
    rm = await browser.new_page(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    await rm.goto(BASE + "/", wait_until="domcontentloaded")
    await rm.wait_for_timeout(900)
    skip = rm.get_by_role("button", name="Skip intro")
    if await skip.count():
        await skip.first.click()
        await rm.wait_for_timeout(400)
    await rm.evaluate(
        "() => { const el = document.querySelector('[data-encounter=\"bugwiser\"]'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'instant' }); }"
    )
    await rm.wait_for_timeout(1200)
    await rm.screenshot(path=os.path.join(folder, "reduced-motion.png"))
    rm_anim = await rm.evaluate(
        """() => {
          const running = [];
          for (const el of document.querySelectorAll('[data-encounter="bugwiser"] *')) {
            const cs = getComputedStyle(el);
            if (cs.animationName === 'none') continue;
            const parts = cs.animationDuration.split(',').map(v => v.endsWith('ms') ? parseFloat(v)/1000 : parseFloat(v));
            if (Math.max(...parts) > 0.01) running.push(cs.animationName);
          }
          return running;
        }"""
    )
    opacity = await rm.evaluate(
        """() => {
          const t = document.querySelector('.sd-title-text');
          const plate = document.querySelector('.sd-plate-screen img');
          return {
            title: t ? getComputedStyle(t).opacity : null,
            titleMask: t ? getComputedStyle(t).maskImage : null,
            plateVisible: plate ? plate.getBoundingClientRect().height > 80 : null,
            grainOpacity: getComputedStyle(document.querySelector('.sd-grain')).opacity,
          };
        }"""
    )
    await rm.close()

    metrics = await page.evaluate(
        """() => {
          const scene = document.querySelector('.sd-scene');
          const fig = document.querySelector('.sd-figure');
          const title = document.querySelector('.sd-title-text');
          const plate = document.querySelector('.sd-plate-screen');
          const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
          return {
            viewport: [window.innerWidth, window.innerHeight],
            scene: r(scene),
            figure: r(fig),
            figureShare: +(fig.getBoundingClientRect().width / scene.getBoundingClientRect().width).toFixed(3),
            title: r(title),
            plate: r(plate),
            plateTextPx: plate ? getComputedStyle(document.querySelector('.sd-plate-caption')).fontSize : null,
            active: document.querySelector('[data-encounter="bugwiser"]').dataset.active,
            overflowX: document.documentElement.scrollWidth - window.innerWidth,
            articleHeight: Math.round(document.querySelector('[data-encounter="bugwiser"]').getBoundingClientRect().height),
            character: document.querySelector('[data-encounter="bugwiser"]').dataset.character,
          };
        }"""
    )
    await page.close()
    return {"label": label, "metrics": metrics, "reduced": rm_anim, "reducedState": opacity, "errors": errors}


async def main():
    os.makedirs(OUT, exist_ok=True)
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, w, h in VIEWPORTS:
            results.append(await run(browser, label, w, h))
        await browser.close()
    print(json.dumps(results, indent=1))
    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(results, fh, indent=1)


asyncio.run(main())
