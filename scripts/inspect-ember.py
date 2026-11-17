"""Phase 6.2 — Experience active-chapter synchronisation probe.

Scrolling chapter by chapter, verifies that the sticky rail and the right-hand
record agree on the active chapter, that the ember overlay is clipped to the
company glyphs and appears only on activation, and captures the sweep mid-flight.

Usage: python scripts/inspect-ember.py <label> <width> <height>
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
OUT = f"screenshots/phase62/{LABEL}"

STATE_JS = """() => {
  const railNodes = [...document.querySelectorAll('[data-experience-world] ~ * [data-ledger-rail] .rounded-full')];
  const section = document.getElementById('experience');
  const railActive = [...section.querySelectorAll('[data-ledger-rail] .rounded-full')]
    .findIndex(el => getComputedStyle(el).backgroundColor === 'rgb(201, 163, 95)');
  const records = [...section.querySelectorAll('li[data-chapter-index]')];
  const recordActive = records.findIndex(el => el.dataset.active === 'true');
  const embers = [...section.querySelectorAll('.exp-ember')];
  const heading = [...section.querySelectorAll('h3')].find(h => h.querySelector('.exp-ember')) || null;
  const r = embers[0] ? embers[0].getBoundingClientRect() : null;
  const hr = heading ? heading.getBoundingClientRect() : null;
  return {
    y: Math.round(window.scrollY),
    railActive,
    recordActive,
    agree: railActive === -1 ? null : railActive === recordActive,
    emberCount: embers.length,
    ember: embers[0] ? {
      backgroundClip: getComputedStyle(embers[0]).backgroundClip,
      position: getComputedStyle(embers[0]).position,
      opacity: Number(getComputedStyle(embers[0]).opacity).toFixed(2),
      sameBox: hr ? Math.abs(r.left - hr.left) < 1 && Math.abs(r.top - hr.top) < 1 && Math.abs(r.width - hr.width) < 1 && Math.abs(r.height - hr.height) < 1 : null,
    } : null,
    fog: records[recordActive] ? {
      opacity: Number(getComputedStyle(records[recordActive], '::before').opacity).toFixed(2),
    } : null,
    activeRecordName: records[recordActive]?.querySelector('h3')?.textContent.trim() ?? null,
    railName: (() => {
      const rail = section.querySelector('[data-ledger-rail]');
      if (!rail) return null;
      const rows = [...rail.querySelectorAll('[data-reached]')];
      return null;
    })(),
  };
}"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"label": LABEL, "viewport": [W, H], "steps": []}

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
            await page.wait_for_timeout(1300)
            return context, page

        async def chapter_offset(page, index, anchor=0.3):
            return await page.evaluate(
                """([i, anchor]) => {
                    const li = document.querySelectorAll('#experience li[data-chapter-index]')[i];
                    return li.getBoundingClientRect().top + window.scrollY - window.innerHeight * anchor;
                }""",
                [index, anchor],
            )

        context, page = await open_page()
        # Warm the section so the reveal phase is 'content'.
        await page.evaluate(
            "(y) => window.scrollTo({ top: y, behavior: 'instant' })",
            await chapter_offset(page, 0),
        )
        await page.wait_for_timeout(2200)

        for index in range(3):
            await page.evaluate(
                "(y) => window.scrollTo({ top: y, behavior: 'instant' })",
                await chapter_offset(page, index),
            )
            # Photograph the sweep from the moment the chapter becomes active:
            # the observer settles after ~140 ms and the sweep starts ~220 ms
            # later, so a tight poll plus an immediate capture lands inside it.
            deadline = asyncio.get_event_loop().time() + 5
            while asyncio.get_event_loop().time() < deadline:
                state = await page.evaluate(STATE_JS)
                if state["recordActive"] == index:
                    break
                await page.wait_for_timeout(40)
            started = await page.evaluate(STATE_JS)
            await page.screenshot(path=f"{OUT}/ember-ch{index + 1}-start.png")
            mid = await page.evaluate(STATE_JS)
            await page.screenshot(path=f"{OUT}/ember-ch{index + 1}-sweep.png")
            await page.wait_for_timeout(1600)
            settled = await page.evaluate(STATE_JS)
            await page.screenshot(path=f"{OUT}/ember-ch{index + 1}-settled.png")
            report["steps"].append(
                {
                    "chapter": index + 1,
                    "started": started,
                    "midSweep": mid,
                    "settled": settled,
                }
            )

        # Return to chapter 1 to confirm the sweep replays on a real change.
        await page.evaluate(
            "(y) => window.scrollTo({ top: y, behavior: 'instant' })",
            await chapter_offset(page, 0),
        )
        await page.wait_for_timeout(700)
        report["replayOnReturn"] = await page.evaluate(STATE_JS)

        # Idle for 3 s without scrolling: no new sweep should appear.
        await page.wait_for_timeout(3000)
        report["idle"] = await page.evaluate(STATE_JS)
        await context.close()

        context, page = await open_page(reduced=True)
        await page.evaluate(
            "(y) => window.scrollTo({ top: y, behavior: 'instant' })",
            await chapter_offset(page, 1),
        )
        report["reducedMotionDisplay"] = await page.evaluate(
            "() => { const el = document.querySelector('#experience .exp-ember'); return el ? getComputedStyle(el).display : 'absent'; }"
        )
        await page.wait_for_timeout(1600)
        report["reducedMotion"] = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/ember-reduced.png")
        await context.close()

        await browser.close()

    with open(f"{OUT}/ember-report.json", "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))


asyncio.run(main())
