"""Phase 6.14 — diagnose the ResQ Wind Release cost.

Parks the ResQ stage, lets the technique arm, then samples requestAnimationFrame
deltas for 3.5s with the page completely still. Each variant disables exactly one
candidate cost so the bottleneck is identified by measurement instead of guess.

Metrics per variant:
  frame p50 / p95 / long-frame share  — what the visitor sees
  TaskDuration delta                  — CPU time burned by main-thread work
  LayoutCount / RecalcStyleCount      — whether anything is triggering layout

Headless Chromium rasterises SVG on the CPU, so paint cost is measurable here;
CPU throttling amplifies it the way a mid-range phone would.

Usage: python scripts/diagnose-phase614-resq.py [base_url] [--mobile]
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
    ("no drop-shadow on wind strokes", """
        .wnd-ribbon, .wnd-current { filter: none !important; }
    """),
    ("no stroke-dash animations", """
        .wnd-stratum, .wnd-ribbon, .wnd-current, .wnd-spiral,
        .wnd-wave-rib, .wnd-arc, .wnd-ring { animation: none !important; }
    """),
    ("no gusts / travel / spray", """
        .wnd-gusts, .wnd-travel, .wnd-release .wnd-spray, .wnd-motes { display: none !important; }
    """),
    ("no vortex / spiral rotation", """
        .wnd-vortex, .wnd-spirals { animation: none !important; }
    """),
    ("no will-change on slides", """
        .wnd-slide { will-change: auto !important; }
    """),
    ("everything above", """
        .wnd-ribbon, .wnd-current { filter: none !important; }
        .wnd-stratum, .wnd-ribbon, .wnd-current, .wnd-spiral,
        .wnd-wave-rib, .wnd-arc, .wnd-ring { animation: none !important; }
        .wnd-gusts, .wnd-travel, .wnd-release .wnd-spray, .wnd-motes { display: none !important; }
        .wnd-vortex, .wnd-spirals { animation: none !important; }
        .wnd-slide { will-change: auto !important; }
    """),
    ("control (rerun)", ""),
]


async def park_stage(page, ratio=0.05):
    for _ in range(200):
        delta = await page.evaluate(
            """(ratio) => {
                const el = document.querySelector('[data-encounter="resq"]');
                if (!el) return null;
                const stage = el.querySelector('section');
                return stage.getBoundingClientRect().top - innerHeight * ratio;
            }""",
            ratio,
        )
        if delta is None or abs(delta) < 60:
            break
        await page.mouse.wheel(0, max(-900, min(900, delta)))
        await page.wait_for_timeout(70)
    await page.wait_for_timeout(900)


async def leave_stage(page):
    await page.mouse.wheel(0, 1900)
    await page.wait_for_timeout(1200)


async def metrics(page):
    data = await page.context.new_cdp_session(page).send("Performance.getMetrics")
    return {m["name"]: m["value"] for m in data["metrics"]}


async def sample(page, ms=3500):
    cdp = await page.context.new_cdp_session(page)
    await cdp.send("Performance.enable")
    before = {m["name"]: m["value"] for m in (await cdp.send("Performance.getMetrics"))["metrics"]}
    await page.evaluate(SAMPLER)
    await page.wait_for_timeout(ms)
    frames = await page.evaluate("() => { window.__sampling = false; return window.__frames; }")
    after = {m["name"]: m["value"] for m in (await cdp.send("Performance.getMetrics"))["metrics"]}
    frames = [f for f in frames if f > 0]
    if not frames:
        return None
    ordered = sorted(frames)
    return {
        "frames": len(frames),
        "p50": round(statistics.median(frames), 1),
        "p95": round(ordered[max(0, int(len(ordered) * 0.95) - 1)], 1),
        "long_share_pct": round(sum(1 for f in frames if f > 33.4) / len(frames) * 100, 1),
        "max": round(max(frames), 1),
        "task_ms": round((after["TaskDuration"] - before["TaskDuration"]) * 1000),
        "layout": round(after["LayoutCount"] - before["LayoutCount"]),
        "recalc_style": round(after["RecalcStyleCount"] - before["RecalcStyleCount"]),
    }


async def run_variant(page, label, css):
    handle = await page.add_style_tag(content=css) if css else None
    runs = []
    for _ in range(2):
        await leave_stage(page)
        await park_stage(page)
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
        "task_ms": round(statistics.median(r["task_ms"] for r in runs)),
        "layout": round(statistics.median(r["layout"] for r in runs)),
        "recalc_style": round(statistics.median(r["recalc_style"] for r in runs)),
        "runs": runs,
    }
    print(f"  {label:<34} p50={merged['p50']:>5}  p95={merged['p95']:>5}  long={merged['long_share_pct']:>5}%  task={merged['task_ms']:>6}ms  layout={merged['layout']}  style={merged['recalc_style']}")
    return merged


async def main():
    results = {}
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
        await page.wait_for_timeout(1500)

        cdp = await ctx.new_cdp_session(page)
        if THROTTLE > 1:
            await cdp.send("Emulation.setCPUThrottlingRate", {"rate": THROTTLE})
        await cdp.send("Performance.enable")

        print(f"\nResQ Wind Release — {VIEWPORT['width']}x{VIEWPORT['height']}, CPU throttle x{THROTTLE}")
        print(f"  {'variant':<34} {'frame p50':>10}  {'p95':>5}  {'long':>6}  {'task':>9}  layout  style")
        for label, css in VARIANTS:
            results[label] = await run_variant(page, label, css)

        await browser.close()

    with open("screenshots/phase614/resq-diagnosis.json", "w", encoding="utf-8") as fh:
        json.dump({"viewport": VIEWPORT, "throttle": THROTTLE, "results": results}, fh, indent=2)
    print("\nwrote screenshots/phase614/resq-diagnosis.json")


asyncio.run(main())
