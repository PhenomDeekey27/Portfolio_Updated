"""
PHASE 6.15 — wind stage frame timing, paired against a reference section.

Reports the ResQ stage and the #contact band, in that order, in a single page
session, and prints the stage cost relative to the reference. Run it once per
build (old vs new) and compare medians; absolute fps on this machine swings with
whatever else is running, so the reference is the calibration.

    python scripts/measure-phase615-wind.py --label 6.14
"""

import argparse
import asyncio
import json
import statistics

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

REPLAY = """async () => {
  const a = document.querySelector('[data-jutsu="wind"]');
  if (!a) return false;
  a.setAttribute('data-active', 'false');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  a.setAttribute('data-active', 'true');
  return true;
}"""


async def scroll_to(page, sel):
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
    ap.add_argument("--label", required=True)
    ap.add_argument("--cycles", type=int, default=4)
    ap.add_argument("--ms", type=int, default=1600)
    args = ap.parse_args()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(800)

        await scroll_to(page, "#contact")
        await page.wait_for_timeout(2500)
        refs = [await page.evaluate(SAMPLE, args.ms) for _ in range(2)]

        await scroll_to(page, '[data-jutsu="wind"] .wnd-stage')
        await page.wait_for_timeout(7000)

        stage = []
        for _ in range(args.cycles):
            await page.evaluate(REPLAY)
            stage.append(await page.evaluate(SAMPLE, args.ms))
            await page.wait_for_timeout(2400)

        ref_fps = statistics.median(r["fps"] for r in refs)
        stage_fps = statistics.median(r["fps"] for r in stage)
        out = {
            "label": args.label,
            "reference": {"fps_median": ref_fps, "samples": refs},
            "stage": {"fps_median": stage_fps, "samples": stage},
            "ratio": round(stage_fps / ref_fps, 2) if ref_fps else None,
        }
        print(
            f"{args.label:<28} reference {ref_fps:>5} fps   stage {stage_fps:>5} fps"
            f"   p50 {statistics.median(r['p50'] for r in stage):>6} ms"
            f"   ratio {out['ratio']}"
        )
        print(f"  stage samples: {[r['fps'] for r in stage]}")
        with open(f"screenshots/phase615/perf-{args.label}.json", "w") as fh:
            json.dump(out, fh, indent=1)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
