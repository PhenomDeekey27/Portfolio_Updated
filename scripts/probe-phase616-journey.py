"""
PHASE 6.16 — one continuous journey, top to bottom and back, real gestures.

Every encounter is entered four times in a full round trip (down past it, then
up past it, then back down…), so this is the closest automated stand-in for the
reported "Home → BugWiser → ResQ → ENN → Saravaraj → Contact and back" journey.
Arms are counted per encounter in each direction, and the copy opacity is
sampled while an encounter is away to prove the record never disappears.

    python scripts/probe-phase616-journey.py --width 390 --height 844 --touch
"""

import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
OUT = Path("screenshots/phase616")
JUTSU = ["sand", "wind", "water", "fire"]

INSTRUMENT = """() => {
  window.__arms = {sand: [], wind: [], water: [], fire: []};
  window.__away = [];
  for (const jutsu of ["sand","wind","water","fire"]) {
    const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
    if (!art) continue;
    const mo = new MutationObserver(() => {
      if (art.dataset.active === "true") {
        const title = art.querySelector('h3');
        const anims = title ? title.getAnimations({subtree:true}) : [];
        window.__arms[jutsu].push({
          t: Math.round(performance.now()),
          y: Math.round(window.scrollY),
          titleAnims: [...new Set(anims.map((a) => a.animationName))],
        });
      } else {
        const p = art.querySelector('[class$="-intro"]');
        window.__away.push({
          jutsu,
          introOpacity: p ? Number(getComputedStyle(p).opacity) : null,
          titleOpacity: (() => {
            const h = art.querySelector('h3');
            return h ? Number(getComputedStyle(h).opacity) : null;
          })(),
        });
      }
    });
    mo.observe(art, {attributes: true, attributeFilter: ["data-active"]});
  }
}"""


async def drag(page, cdp, down: bool, touch: bool) -> None:
    if touch:
        start, end = (700, 200) if down else (220, 700)
        await cdp.send(
            "Input.dispatchTouchEvent",
            {"type": "touchStart", "touchPoints": [{"x": 195, "y": start}]},
        )
        for step in range(1, 11):
            y = start + (end - start) * step / 10
            await cdp.send(
                "Input.dispatchTouchEvent",
                {"type": "touchMove", "touchPoints": [{"x": 195, "y": y}]},
            )
            await asyncio.sleep(0.016)
        await cdp.send(
            "Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}
        )
    else:
        await page.mouse.wheel(0, 520 if down else -520)
    await asyncio.sleep(0.16)


async def sweep(page, cdp, down: bool, touch: bool) -> None:
    for _ in range(150):
        at_edge = await page.evaluate(
            "(down) => down ? window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4 : window.scrollY <= 4",
            down,
        )
        if at_edge:
            break
        await drag(page, cdp, down, touch)
    await asyncio.sleep(2.0)


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=844)
    ap.add_argument("--touch", action="store_true")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": args.width, "height": args.height},
            is_mobile=args.touch,
            has_touch=args.touch,
        )
        page = await ctx.new_page()
        cdp = await ctx.new_cdp_session(page)
        await page.goto(URL, wait_until="load")
        await asyncio.sleep(9.5)  # Home intro
        await page.evaluate(INSTRUMENT)

        await sweep(page, cdp, True, args.touch)   # down the whole page
        down = await page.evaluate("() => structuredClone(window.__arms)")
        await sweep(page, cdp, False, args.touch)  # back up
        up = await page.evaluate("() => structuredClone(window.__arms)")
        away = await page.evaluate("() => window.__away")
        await browser.close()

    summary = {}
    for jutsu in JUTSU:
        down_arms = [a for a in down.get(jutsu, [])]
        up_arms = [a for a in up.get(jutsu, [])][len(down_arms):]
        summary[jutsu] = {
            "downArms": len(down_arms),
            "upArms": len(up_arms),
            "upTitleAnims": [a["titleAnims"] for a in up_arms],
            "replayedOnReturn": len(up_arms) > 0,
        }
        print(jutsu, "down:", len(down_arms), "up:", len(up_arms),
              "upTitles:", [a["titleAnims"] for a in up_arms])

    readable = [
        row for row in away if row["introOpacity"] is not None and row["introOpacity"] > 0.5
    ]
    print(f"\naway samples: {len(away)} · copy readable in {len(readable)}")
    print("SUMMARY", json.dumps(summary, indent=2))

    (OUT / f"journey-{args.width}.json").write_text(
        json.dumps({"summary": summary, "away": away}, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    asyncio.run(main())
