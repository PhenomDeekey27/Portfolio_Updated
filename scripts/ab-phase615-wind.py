"""
PHASE 6.15 — paired A/B frame timing for the ResQ stage.

Frame-rate absolute values on this machine swing by 3x between runs (other
browsers on the box, first-load caches, GC). A one-shot measurement therefore
proves nothing, so this harness interleaves the variants inside a single page
session — A, B, C, A, B, C … — and reports the median of each, which cancels
drift in machine load. It also measures a deliberately light section as a
reference, so "the wind stage is slow" can be stated relative to the rest of the
same page rather than in absolute fps.

Variants are applied as toggled stylesheet rules on the live page:

  control            as shipped
  no motes           .wnd-motes hidden (26 blurred HTML glows)
  no plates          the six wind SVG plates hidden
  no offscreen anims every running animation outside the wind article paused

Usage:
    python scripts/ab-phase615-wind.py --label after [--throttle 1]
"""

import argparse
import asyncio
import json
import statistics
from collections import defaultdict

from playwright.async_api import async_playwright

URL = "http://localhost:3100"

SAMPLE = """async (ms) => {
  const f = [];
  let last = performance.now();
  await new Promise((r) => {
    const t0 = performance.now();
    const tick = (t) => {
      f.push(t - last);
      last = t;
      if (t - t0 < ms) requestAnimationFrame(tick);
      else r();
    };
    requestAnimationFrame(tick);
  });
  f.shift();
  const s = [...f].sort((a, b) => a - b);
  const q = (p) => +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1);
  return { fps: +(f.length / (ms / 1000)).toFixed(1), p50: q(0.5), p95: q(0.95) };
}"""

VARIANTS = {
    "control": "",
    "no motes": "[data-jutsu='wind'] .wnd-motes{display:none !important}",
    "no plates": "[data-jutsu='wind'] .wnd-field{display:none !important}",
    "no offscreen anims": "__JS__",
}

PAUSE_JS = """() => {
  const art = document.querySelector('[data-jutsu="wind"]');
  let n = 0;
  for (const a of document.getAnimations()) {
    const t = a.effect && a.effect.target;
    if (!t || !art || art.contains(t)) continue;
    const r = t.getBoundingClientRect();
    if (r.bottom < -80 || r.top > innerHeight + 80) { try { a.pause(); n++; } catch (e) {} }
  }
  window.__p615Paused = n;
  return n;
}"""

RESUME_JS = """() => {
  for (const a of document.getAnimations()) {
    if (a.playState === 'paused') { try { a.play(); } catch (e) {} }
  }
  window.__p615Paused = 0;
}"""

REPLAY = """async () => {
  const a = document.querySelector('[data-jutsu="wind"]');
  a.setAttribute('data-active', 'false');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  a.setAttribute('data-active', 'true');
}"""


async def goto_section(page, sel):
    await page.evaluate(
        """(sel) => {
          const el = document.querySelector(sel);
          const y = el.getBoundingClientRect().top + window.scrollY;
          window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
        }""",
        sel,
    )


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", default="run")
    ap.add_argument("--throttle", type=float, default=1.0)
    ap.add_argument("--cycles", type=int, default=4)
    ap.add_argument("--ms", type=int, default=1600)
    args = ap.parse_args()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        cdp = await page.context.new_cdp_session(page)
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(600)

        if args.throttle > 1:
            await cdp.send("Emulation.setCPUThrottlingRate", {"rate": args.throttle})

        # Reference: a light section of the same page.
        await goto_section(page, "#contact")
        await page.wait_for_timeout(2500)
        reference = await page.evaluate(SAMPLE, args.ms)

        await goto_section(page, '[data-jutsu="wind"] .wnd-stage')
        await page.wait_for_timeout(6000)

        handles = {}
        results = defaultdict(list)
        paused_counts = []
        for cycle in range(args.cycles):
            for name, css in VARIANTS.items():
                if css == "__JS__":
                    paused_counts.append(await page.evaluate(PAUSE_JS))
                elif css:
                    if name not in handles:
                        handles[name] = await page.add_style_tag(content=css)
                    await handles[name].evaluate("(el) => { el.disabled = false }")
                await page.wait_for_timeout(180)
                await page.evaluate(REPLAY)
                results[name].append(await page.evaluate(SAMPLE, args.ms))
                await page.wait_for_timeout(2200)  # let the sequence finish
                if css == "__JS__":
                    await page.evaluate(RESUME_JS)
                elif name in handles:
                    await handles[name].evaluate("(el) => { el.disabled = true }")
                    await page.wait_for_timeout(120)

        print(f"ResQ stage paired A/B — 1366x768, CPU throttle x{args.throttle:g}, "
              f"{args.cycles} cycles, label '{args.label}'")
        print(f"  reference #contact: {reference['fps']} fps (p50 {reference['p50']} ms)")
        summary = {"reference": reference, "paused": paused_counts[-1] if paused_counts else 0}
        for name in VARIANTS:
            fps = [r["fps"] for r in results[name]]
            p50 = [r["p50"] for r in results[name]]
            summary[name] = {
                "fps_median": statistics.median(fps),
                "fps_samples": fps,
                "p50_median": statistics.median(p50),
            }
            print(
                f"  {name:<20} median {statistics.median(fps):>5} fps   "
                f"p50 {statistics.median(p50):>5} ms   samples {fps}"
            )
        if paused_counts:
            print(f"  offscreen animations paused: {paused_counts[-1]}")

        with open(f"screenshots/phase615/ab-wind-{args.label}.json", "w") as fh:
            json.dump(summary, fh, indent=1)
        print(f"\nwrote screenshots/phase615/ab-wind-{args.label}.json")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
