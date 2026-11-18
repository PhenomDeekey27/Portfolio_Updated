"""
PHASE 6.16 — decorative replay probe with REAL scrolling, one encounter at a time.

The phase-6.15 harness *jumped* the page with `scrollTo`; this one moves it only
the way a visitor does — `page.mouse.wheel` on desktop, a CDP-synthesised touch
gesture on phones — and checks both approach directions:

    A. park just below the stage, scroll UP into it     (entering from below)
    B. scroll DOWN until the stage is completely gone    (reset)
    C. scroll DOWN into it again                         (entering from above)

Only the approach itself is real scrolling; the parking jump uses the app's own
instant recipe. Per arm it records the decorative title animation that is
actually running, so the evidence is a restarted title wipe, not a boolean.

    python scripts/probe-phase616-replay.py --width 390 --height 844 --touch
"""

import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
OUT = Path("screenshots/phase616")
JUTSU = ["sand", "wind", "water", "fire"]

PARK = """(y) => {
  const html = document.documentElement, body = document.body;
  const prev = [html.style.overflow, body.style.overflow];
  html.style.overflow = ''; body.style.overflow = '';
  window.scrollTo({ top: y, behavior: 'instant' });
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
  html.style.overflow = prev[0]; body.style.overflow = prev[1];
}"""

STATE = """(jutsu) => {
  const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
  if (!art) return null;
  const stage = art.querySelector('[class$="-stage"]');
  const title = art.querySelector('h3');
  const r = stage.getBoundingClientRect();
  const anims = title ? title.getAnimations({ subtree: true }) : [];
  return {
    scrollY: Math.round(window.scrollY),
    active: art.dataset.active,
    visible: Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)),
    stageTop: Math.round(r.top),
    stageBottom: Math.round(r.bottom),
    anims: anims.length,
    titleAnims: [...new Set(anims.map((a) => a.animationName))],
    titleMask: title ? getComputedStyle(title).webkitMaskPosition : null,
    copyOpacity: (() => {
      const p = art.querySelector('[class$="-intro"]');
      return p ? Number(getComputedStyle(p).opacity) : null;
    })(),
  };
}"""


async def wheel(page, cdp, delta: int, touch: bool, settle: float) -> None:
    if touch:
        # A real finger drag: `delta > 0` means content moves up, i.e. scroll
        # down, so the finger travels from the lower half to the upper half.
        # Both points are sized to the viewport: a fixed y=700 start is below a
        # 655px-tall phone screen, so the gesture is never delivered.
        viewport = page.viewport_size or {"width": 390, "height": 844}
        high = viewport["height"] * 0.82
        low = viewport["height"] * 0.18
        start = high if delta > 0 else low
        end = low if delta > 0 else high
        x = viewport["width"] / 2
        await cdp.send(
            "Input.dispatchTouchEvent",
            {"type": "touchStart", "touchPoints": [{"x": x, "y": start}]},
        )
        for step in range(1, 13):
            y = start + (end - start) * step / 12
            await cdp.send(
                "Input.dispatchTouchEvent",
                {"type": "touchMove", "touchPoints": [{"x": x, "y": y}]},
            )
            await asyncio.sleep(0.016)
        await cdp.send(
            "Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}
        )
    else:
        await page.mouse.wheel(0, delta)
    await asyncio.sleep(settle)


async def approach(page, cdp, jutsu, direction, touch, panorama):
    """Scroll towards the stage until it is properly on screen."""
    for _ in range(14):
        state = await page.evaluate(STATE, jutsu)
        if state is None:
            return None
        on_screen = state["visible"] > min(state["stageBottom"] - state["stageTop"], 200) * 0.6
        if on_screen and state["active"] == "true":
            break
        await wheel(page, cdp, 380 * direction, touch, 0.28)
    await asyncio.sleep(panorama)
    return await page.evaluate(STATE, jutsu)


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=844)
    ap.add_argument("--touch", action="store_true")
    ap.add_argument("--panorama", type=float, default=1.3)
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    results = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=1,
            is_mobile=args.touch,
            has_touch=args.touch,
        )
        page = await ctx.new_page()
        cdp = await ctx.new_cdp_session(page)
        await page.goto(URL, wait_until="load")
        await asyncio.sleep(9.5)  # let the Home intro finish

        for jutsu in JUTSU:
            box = await page.evaluate(
                """(jutsu) => {
                  const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
                  const stage = art.querySelector('[class$="-stage"]');
                  const r = stage.getBoundingClientRect();
                  return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, h: r.height };
                }""",
                jutsu,
            )
            # ---- A: park ABOVE the stage, scroll DOWN into it ---------------
            await page.evaluate(PARK, max(0, box["top"] - args.height * 0.75))
            await asyncio.sleep(1.0)
            from_above = await approach(page, cdp, jutsu, 1, args.touch, args.panorama)
            await page.screenshot(
                path=str(OUT / f"replay-{args.width}-{jutsu}-above.png")
            )

            # ---- B: scroll DOWN until the stage is completely gone ----------
            away = None
            for _ in range(34):
                away = await page.evaluate(STATE, jutsu)
                if away and away["visible"] == 0 and away["active"] == "false":
                    break
                await wheel(page, cdp, 700, args.touch, 0.3)
            await asyncio.sleep(0.6)

            # ---- C: scroll UP into it again (entering from below) -----------
            from_below = await approach(page, cdp, jutsu, -1, args.touch, args.panorama)
            await page.screenshot(
                path=str(OUT / f"replay-{args.width}-{jutsu}-below.png")
            )

            results[jutsu] = {
                "fromAbove": from_above,
                "away": away,
                "fromBelow": from_below,
            }
            print(
                jutsu,
                "| above:", from_above and (from_above["active"], from_above["titleAnims"]),
                "| away:", away and (away["active"], away["visible"]),
                "| below:", from_below and (from_below["active"], from_below["titleAnims"]),
            )

        await browser.close()

    (OUT / f"replay-{args.width}.json").write_text(
        json.dumps(results, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    asyncio.run(main())
