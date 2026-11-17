"""Phase 6.13 — measured cost of the mobile sand sequence.

The whole-page A/B was dominated by scroll and compositor noise, so this
measures the animation itself: park the BugWiser stage in view, let the
technique start, then sample requestAnimationFrame deltas for 3.5s with the
page completely still. Nothing else is moving, so the frame budget belongs to
the encounter.

Two conditions, interleaved, on the same page and the same production build:

  6.12  the displacement filter and the full mote set forced back on
  6.13  the current mobile budget

CPU is throttled 4x to stand in for a mid-range phone.

Usage: python scripts/measure-phase613-mobile-budget.py [base_url]
"""

import asyncio
import json
import statistics
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
OUT = "screenshots/phase613"

OVERRIDE = """
  @media (max-width: 1023px) {
    .bw-wave-upper, .bw-wave-lower { filter: url(#bw-sand-rough) !important; }
    .bw-motes-stream .bw-mote:nth-child(n + 11),
    .bw-motes-burst .bw-mote:nth-child(n + 9) { display: block !important; }
  }
"""

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

SCROLL_TO = """
(ratio) => {
  const el = document.querySelector('[data-encounter="bugwiser"]');
  if (!el) return false;
  const stage = el.querySelector('section');
  if (!stage) return false;
  const target = stage.getBoundingClientRect().top + window.scrollY - window.innerHeight * ratio;
  const lenis = window.__lenis;
  window.scrollTo({ top: Math.max(0, target), behavior: 'instant' });
  if (lenis) lenis.scrollTo(Math.max(0, target), { immediate: true });
  return true;
}
"""


async def wheel(page, delta, steps=1):
    for _ in range(steps):
        await page.mouse.wheel(0, delta)
        await page.wait_for_timeout(60)


async def sample(page, ms=3500):
    await page.evaluate(SAMPLER)
    await page.wait_for_timeout(ms)
    frames = await page.evaluate("() => { window.__sampling = false; return window.__frames; }")
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
    }


async def run_condition(page, label, with_override, repeats=4):
    handle = await page.add_style_tag(content=OVERRIDE) if with_override else None
    samples = []
    for _ in range(repeats):
        # Leave the stage, then re-enter so the technique starts fresh.
        await wheel(page, 2200, steps=6)
        await page.wait_for_timeout(500)
        await wheel(page, -1400, steps=6)
        await page.wait_for_timeout(500)
        # Wait for the stage to be in view and armed.
        for _ in range(20):
            active = await page.evaluate(
                "() => document.querySelector('[data-encounter=\"bugwiser\"]')?.getAttribute('data-active')"
            )
            if active == "true":
                break
            await page.wait_for_timeout(100)
        result = await sample(page)
        if result:
            samples.append(result)
    if handle:
        await handle.evaluate("(el) => el.remove()")
    merged = {
        "samples": samples,
        "median_p50": round(statistics.median(s["p50"] for s in samples), 1),
        "median_p95": round(statistics.median(s["p95"] for s in samples), 1),
        "median_long_share": round(statistics.median(s["long_share_pct"] for s in samples), 1),
    }
    print(f"  [{label}] {json.dumps(merged)}")
    return merged


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await ctx.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(1500)

        # Reach BugWiser once with real wheel events.
        for _ in range(200):
            pos = await page.evaluate(
                """() => {
                    const el = document.querySelector('[data-encounter="bugwiser"]');
                    if (!el) return null;
                    return el.querySelector('section').getBoundingClientRect().top - window.innerHeight * 0.2;
                }"""
            )
            if pos is None:
                break
            if abs(pos) < 80:
                break
            await page.mouse.wheel(0, max(-900, min(900, pos)))
            await page.wait_for_timeout(70)
        await page.wait_for_timeout(1500)

        cdp = await ctx.new_cdp_session(page)
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

        # Interleave to cancel drift.
        old_a = await run_condition(page, "6.12 filter + all motes", True)
        new_a = await run_condition(page, "6.13 mobile budget", False)
        old_b = await run_condition(page, "6.12 filter + all motes (rerun)", True)
        new_b = await run_condition(page, "6.13 mobile budget (rerun)", False)

        def med(key):
            return round(statistics.median([old_a[key], old_b[key]]), 1), round(
                statistics.median([new_a[key], new_b[key]]), 1
            )

        p50_old, p50_new = med("median_p50")
        p95_old, p95_new = med("median_p95")
        long_old, long_new = med("median_long_share")
        summary = {
            "device": "390x844, 4x CPU throttle, headless Chromium",
            "method": "stationary requestAnimationFrame sampling during the sand sequence",
            "p50_ms": {"baseline_6_12": p50_old, "optimised_6_13": p50_new},
            "p95_ms": {"baseline_6_12": p95_old, "optimised_6_13": p95_new},
            "long_frame_share_pct": {"baseline_6_12": long_old, "optimised_6_13": long_new},
            "p95_delta_pct": round((p95_new - p95_old) / p95_old * 100, 1) if p95_old else None,
        }
        print("\nSUMMARY " + json.dumps(summary, indent=2))
        with open(f"{OUT}/perf-mobile-budget.json", "w", encoding="utf-8") as fh:
            json.dump(summary, fh, indent=2)
        await browser.close()


asyncio.run(main())
