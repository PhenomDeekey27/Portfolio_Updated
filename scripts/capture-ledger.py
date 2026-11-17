"""Phase 6.1 — visual inspection of the Experience career ledger.

Captures the section at the top, middle and end of its scroll range, probes the
sticky rail geometry, overflow, and reduced-motion rendering.

Usage: python scripts/capture-ledger.py <label> <width> <height>
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "desktop"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1920
H = int(sys.argv[3]) if len(sys.argv) > 3 else 1080
OUT = f"screenshots/phase61/{LABEL}"

STATE_JS = """() => {
  const section = document.getElementById('experience');
  const rail = document.querySelector('[data-ledger-rail]');
  const records = document.querySelector('[data-ledger-records]');
  const card = rail ? rail.querySelector('.exp-folio') : null;
  const rect = (el) => el ? el.getBoundingClientRect() : null;
  return {
    y: Math.round(window.scrollY),
    sectionHeight: section ? Math.round(section.getBoundingClientRect().height) : null,
    sectionTop: section ? Math.round(section.getBoundingClientRect().top) : null,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    railDisplay: rail ? getComputedStyle(rail).display : null,
    railPosition: card ? getComputedStyle(card.closest('[class*=sticky]') || card).position : null,
    cardTop: card ? Math.round(card.getBoundingClientRect().top) : null,
    cardBottom: card ? Math.round(card.getBoundingClientRect().bottom) : null,
    recordsLeft: records ? Math.round(records.getBoundingClientRect().left) : null,
    activeChapter: document.querySelector('[data-chapter-index][data-active="true"]')?.dataset.chapterIndex ?? null,
    reached: document.querySelectorAll('.exp-route-segment[data-reached="true"]').length,
    phase: document.querySelector('[data-section-content="experience"]')?.getAttribute('data-reveal-phase'),
    recordCount: document.querySelectorAll('[data-section-content="experience"] li[data-chapter-index]').length,
    latestMarker: !!Array.from(document.querySelectorAll('[data-section-content="experience"] span')).find(el => el.textContent === 'Latest chapter'),
  };
}"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"label": LABEL, "viewport": [W, H], "shots": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def open_page(reduced=False):
            context = await browser.new_context(
                viewport={"width": W, "height": H},
                reduced_motion="reduce" if reduced else "no-preference",
            )
            page = await context.new_page()
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1000)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=2000)
                except Exception:
                    pass
            await page.wait_for_timeout(1200)
            return context, page

        async def scroll_to(page, target_y):
            await page.evaluate(
                "(y) => window.scrollTo({ top: y, behavior: 'instant' })", target_y
            )
            await page.wait_for_timeout(1100)

        context, page = await open_page()
        top = await page.evaluate(
            "() => document.getElementById('experience').getBoundingClientRect().top + window.scrollY"
        )
        height = await page.evaluate(
            "() => document.getElementById('experience').getBoundingClientRect().height"
        )
        report["section"] = {"top": round(top), "height": round(height), "viewport": [W, H]}

        for name, fraction in [("01-top", 0.0), ("02-mid", 0.45), ("03-end", 0.9)]:
            await scroll_to(page, round(top + (height - H) * fraction))
            state = await page.evaluate(STATE_JS)
            report["shots"].append({"name": name, **state})
            await page.screenshot(path=f"{OUT}/{name}.png")

        # Whole-section contact sheet, captured after the viewport shots so the
        # element screenshot's own scrolling cannot corrupt them.
        await page.locator("#experience").screenshot(
            path=f"{OUT}/00-section.png"
        )

        # Sticky proof: cardTop relative to viewport should hold while scrolling.
        await scroll_to(page, round(top + 40))
        before = await page.evaluate(STATE_JS)
        await scroll_to(page, round(top + 420))
        after = await page.evaluate(STATE_JS)
        report["sticky"] = {
            "beforeCardTop": before["cardTop"],
            "afterScroll420CardTop": after["cardTop"],
            "scrollDelta": after["y"] - before["y"],
        }
        report["active"] = await page.evaluate(STATE_JS)
        await context.close()

        context, page = await open_page(reduced=True)
        await scroll_to(page, round(top + 120))
        report["reducedMotion"] = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/04-reduced-motion.png")
        await context.close()

        await browser.close()

    with open(f"{OUT}/report.json", "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))


asyncio.run(main())
