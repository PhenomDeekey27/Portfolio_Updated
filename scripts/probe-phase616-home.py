"""
PHASE 6.16 — Home construction timeline probe.

Samples the phone Home world while the intro runs, so two claims can be checked
from evidence instead of assumed:

  1. the village is actually seen being built (the veil is opaque over the
     finished plate, then clears on the world's final settle), and
  2. the hero copy appears roughly 1-2 s before that settle finishes.

The letter spans, not the <h1> wrapper, carry the reveal opacity, so the probe
reads `#home h1 span span`. The loader is read through `[data-raijin-loader]`.

    python scripts/probe-phase616-home.py [--reduced] [--width 390] [--height 844]
"""

import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
OUT = Path("screenshots/phase616")

SAMPLE = """() => {
  const w = document.querySelector('.leaf-world');
  const letter = document.querySelector('#home h1 span span');
  const loader = document.querySelector('[data-raijin-loader]');
  const veil = document.querySelector('.leaf-plate-veil');
  const copy = document.querySelector('#home h1');
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const veilStyle = cs(veil);
  const loaderStyle = cs(loader);
  return {
    t: Math.round(performance.now()),
    attrs: w ? {...w.dataset} : null,
    settled: document.querySelector('[data-world-settled]')?.dataset.worldSettled ?? null,
    loaderVisible: loaderStyle
      ? loaderStyle.display !== 'none' && Number(loaderStyle.opacity) > 0.01
      : null,
    heroLetterOpacity: letter ? Number(cs(letter).opacity) : null,
    heroBlockOpacity: copy ? Number(cs(copy).opacity) : null,
    veilDisplay: veilStyle ? veilStyle.display : null,
    veilOpacity: veilStyle && veilStyle.display !== 'none'
      ? Number(veilStyle.opacity)
      : null,
    ridgeOpacity: (() => { const r = cs(document.querySelector('.lw-ridge')); return r ? Number(r.opacity) : null; })(),
    streetOpacity: (() => { const s = cs(document.querySelector('.lw-street')); return s ? Number(s.opacity) : null; })(),
    canvas: document.querySelectorAll('canvas').length,
  };
}"""


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--reduced", action="store_true")
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=844)
    ap.add_argument("--throttle", type=float, default=1.0)
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    rows = []

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            reduced_motion="reduce" if args.reduced else "no-preference",
        )
        page = await ctx.new_page()
        if args.throttle > 1:
            cdp = await ctx.new_cdp_session(page)
            await cdp.send("Emulation.setCPUThrottlingRate", {"rate": args.throttle})
        await page.goto(URL, wait_until="domcontentloaded")
        for _ in range(30):
            await asyncio.sleep(0.25)
            rows.append(await page.evaluate(SAMPLE))

        label = f"home-{args.width}-{'reduced' if args.reduced else 'motion'}"
        await page.screenshot(path=str(OUT / f"{label}-final.png"))
        await browser.close()

    for row in rows:
        print(json.dumps(row))

    # First sample at which each milestone is true. Polling is coarse (250 ms),
    # so the gap is reported with that resolution rather than to the millisecond.
    def first(predicate):
        for row in rows:
            if predicate(row):
                return row["t"]
        return None

    first_text = first(lambda r: (r["heroLetterOpacity"] or 0) > 0.5)
    first_settle = first(lambda r: r["settled"] == "true")
    settle_done = first(
        lambda r: r["settled"] == "true" and (r["veilOpacity"] in (None, 0))
    )
    loader_seen = any(r["loaderVisible"] for r in rows)
    print(
        "\nSUMMARY",
        json.dumps(
            {
                "width": args.width,
                "reduced": args.reduced,
                "loaderVisibleAtAnySample": loader_seen,
                "firstHeroLetterSample": first_text,
                "firstSettledSample": first_settle,
                "firstVeilClearSample": settle_done,
                "textLeadBeforeSettleEnd": (
                    settle_done - first_text
                    if (first_text is not None and settle_done is not None)
                    else None
                ),
            },
            indent=2,
        ),
    )

    (OUT / f"probe-home-{label}.json").write_text(
        json.dumps(rows, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    asyncio.run(main())
