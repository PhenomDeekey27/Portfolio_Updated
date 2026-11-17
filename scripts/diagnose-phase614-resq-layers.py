"""Phase 6.14 — layer attribution for the ResQ Wind Release stage.

Round 1 showed the main thread mostly idle while frames took hundreds of ms, so
the cost is raster/compositing, not JavaScript. This pass finds which *layer*
owns it by removing whole layers, including a floor with everything off, plus
the BugWiser sand stage as a calibration reference measured by the same harness.

Usage: python scripts/diagnose-phase614-resq-layers.py [base_url] [--mobile]
"""

import asyncio
import json
import statistics
import sys

from playwright.async_api import async_playwright

BASE = "http://localhost:3100"
MOBILE = "--mobile" in sys.argv
for arg in sys.argv[1:]:
    if arg.startswith("http"):
        BASE = arg

VIEWPORT = {"width": 390, "height": 844} if MOBILE else {"width": 1366, "height": 768}
THROTTLE = 4 if MOBILE else 1

SAMPLER = """
() => {
  window.__frames = [];
  window.__sampling = true;
  let last = performance.now();
  const loop = (t) => {
    if (!window.__sampling) return;
    window.__frames.push(t - last);
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
"""

VARIANTS = [
    ("control", ""),
    ("all stage animations off", ".wnd-stage * { animation: none !important; }"),
    ("field svg hidden", ".wnd-field { display: none !important; }"),
    ("env + atmos + veil hidden", ".wnd-env, .wnd-atmos, .wnd-veil { display: none !important; }"),
    ("copy + rank hidden", ".wnd-copy, .wnd-rank, .wnd-cue { display: none !important; }"),
    ("stage decorations only", """
        .wnd-field, .wnd-env, .wnd-atmos, .wnd-veil { display: none !important; }
    """),
    ("everything off", """
        .wnd-stage * { animation: none !important; }
        .wnd-field, .wnd-env, .wnd-atmos, .wnd-veil, .wnd-copy { display: none !important; }
    """),
    ("control (rerun)", ""),
]


async def park(page, encounter, ratio=0.05):
    for _ in range(200):
        delta = await page.evaluate(
            """(args) => {
                const el = document.querySelector(`[data-encounter="${args.id}"]`);
                if (!el) return null;
                const stage = el.querySelector('section');
                return stage.getBoundingClientRect().top - innerHeight * args.ratio;
            }""",
            {"id": encounter, "ratio": ratio},
        )
        if delta is None or abs(delta) < 60:
            break
        await page.mouse.wheel(0, max(-900, min(900, delta)))
        await page.wait_for_timeout(70)
    await page.wait_for_timeout(900)


async def leave(page):
    await page.mouse.wheel(0, 1900)
    await page.wait_for_timeout(1200)


async def sample(page, ms=3000):
    await page.evaluate(SAMPLER)
    await page.wait_for_timeout(ms)
    frames = await page.evaluate("() => { window.__sampling = false; return window.__frames; }")
    frames = [f for f in frames if f > 0]
    if not frames:
        return None
    ordered = sorted(frames)
    return {
        "p50": round(statistics.median(frames), 1),
        "p95": round(ordered[max(0, int(len(ordered) * 0.95) - 1)], 1),
        "long_share_pct": round(sum(1 for f in frames if f > 33.4) / len(frames) * 100, 1),
        "frames": len(frames),
    }


async def run(page, encounter, label, css):
    handle = await page.add_style_tag(content=css) if css else None
    runs = []
    for _ in range(2):
        await leave(page)
        await park(page, encounter)
        result = await sample(page)
        if result:
            runs.append(result)
    if handle:
        await handle.evaluate("(el) => el.remove()")
    if not runs:
        return None
    merged = {
        "p50": round(statistics.median(r["p50"] for r in runs), 1),
        "p95": round(statistics.median(r["p95"] for r in runs), 1),
        "long_share_pct": round(statistics.median(r["long_share_pct"] for r in runs), 1),
    }
    print(f"  {label:<32} p50={merged['p50']:>6}  p95={merged['p95']:>6}  long={merged['long_share_pct']:>5}%")
    return merged


async def main():
    results = {}
    sand = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport=VIEWPORT)
        page = await ctx.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(2500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(1200)

        cdp = await ctx.new_cdp_session(page)
        if THROTTLE > 1:
            await cdp.send("Emulation.setCPUThrottlingRate", {"rate": THROTTLE})

        print(f"\nResQ layer attribution — {VIEWPORT['width']}x{VIEWPORT['height']}, throttle x{THROTTLE}")
        for label, css in VARIANTS:
            results[label] = await run(page, "resq", label, css)

        print("\nCalibration — BugWiser sand stage, same harness")
        sand["control"] = await run(page, "bugwiser", "sand control", "")
        sand["all off"] = await run(page, "bugwiser", "sand all animations off", ".bw-stage * { animation: none !important; }")

        await browser.close()

    with open("screenshots/phase614/resq-layer-attribution.json", "w", encoding="utf-8") as fh:
        json.dump({"viewport": VIEWPORT, "throttle": THROTTLE, "resq": results, "sand_calibration": sand}, fh, indent=2)
    print("\nwrote screenshots/phase614/resq-layer-attribution.json")


asyncio.run(main())
