"""Production transition acceptance sweep: all 8 routes, both directions.

Same route/identity contract as `verify-transitions.py`, but samples the
transition state cheaply on every wheel step and only encodes a screenshot at
each distinct state. The heavier harness encodes a compressed screenshot per
sample, which on a loaded machine can hide a whole 1.7s sequence between two
samples and report a false "transition never started".

Usage: BASE=http://localhost:3001 python scripts/verify-transitions-prod.py <label> <w> <h>
"""

import asyncio
import io
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "prod"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = f"screenshots/phase64/prod/{LABEL}"

FORWARD = [
    ("about", "flying-raijin-transition"),
    ("skills", "nature-chakra-transition"),
    ("missions", "rasengan-transition"),
    ("experience", "shinobi-map-transition"),
]
BACKWARD = [
    ("missions", "shinobi-map-transition"),
    ("skills", "rasengan-transition"),
    ("about", "nature-chakra-transition"),
    ("home", "flying-raijin-transition"),
]

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  return {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    y: Math.round(window.scrollY),
    overlays: document.querySelectorAll('[data-teleport-state]').length,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    overlayPaint: ov
      ? getComputedStyle(ov).backgroundColor + '|' + getComputedStyle(ov).backgroundImage
      : null,
  };
}"""


def luminance(png_bytes):
    im = Image.open(io.BytesIO(png_bytes)).convert("L").resize((80, 45))
    px = list(im.getdata())
    return round(sum(px) / len(px), 2), round(
        sum(1 for v in px if v < 12) / len(px) * 100, 1
    )


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"label": LABEL, "viewport": [W, H], "routes": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1400)

        async def settle(timeout=8000):
            waited = 0
            while waited < timeout:
                st = await page.evaluate(STATE_JS)
                if st["state"] is None:
                    return st
                await page.wait_for_timeout(50)
                waited += 50
            return await page.evaluate(STATE_JS)

        async def run_route(target, direction, expected):
            vel = 180 if direction == "forward" else -180
            first = None
            for _ in range(90):
                await page.mouse.wheel(0, vel)
                await page.wait_for_timeout(30)
                st = await page.evaluate(STATE_JS)
                if st["state"]:
                    first = st
                    break
            if not first:
                return {
                    "target": target,
                    "direction": direction,
                    "error": "transition never started",
                }

            states, paints, mins, maxdarks = [], [], [], []
            shot = await page.screenshot(type="jpeg", quality=30)
            mean, dark = luminance(shot)
            states.append(first["state"])
            mins.append(mean)
            maxdarks.append(dark)
            if first["overlayPaint"]:
                paints.append(first["overlayPaint"])

            for _ in range(120):
                await page.wait_for_timeout(25)
                st = await page.evaluate(STATE_JS)
                if st["state"] and st["state"] not in states:
                    states.append(st["state"])
                    if st["state"] == "WORLD_SWITCH":
                        shot = await page.screenshot(
                            path=f"{OUT}/{direction}-{target}-WORLD_SWITCH.png"
                        )
                        m, d = luminance(shot)
                        mins.append(m)
                        maxdarks.append(d)
                    if st["overlayPaint"]:
                        paints.append(st["overlayPaint"])
                if st["state"] is None:
                    break

            await page.wait_for_timeout(700)
            final = await page.evaluate(STATE_JS)
            await page.screenshot(path=f"{OUT}/{direction}-{target}-settled.png")
            ident = first["testid"]
            return {
                "target": target,
                "direction": direction,
                "identity": ident,
                "identityOk": ident == expected,
                "states": states,
                "minMean": min(mins),
                "maxDarkPercent": max(maxdarks),
                "settledState": final["state"],
                "settledOverlays": final["overlays"],
                "overflowX": final["overflowX"],
                "overlayPaints": sorted(set(paints)),
            }

        for target, expected in FORWARD:
            r = await run_route(target, "forward", expected)
            report["routes"].append(r)
            print(json.dumps(r), flush=True)
            await settle()
            await page.wait_for_timeout(700)
        for target, expected in BACKWARD:
            r = await run_route(target, "backward", expected)
            report["routes"].append(r)
            print(json.dumps(r), flush=True)
            await settle()
            await page.wait_for_timeout(700)

        await browser.close()

    with open(f"{OUT}/report.json", "w") as fh:
        json.dump(report, fh, indent=2)

    failures = 0
    for r in report["routes"]:
        if r.get("error"):
            failures += 1
            print("FAIL", r["direction"], r["target"], r["error"])
            continue
        opaque = [x for x in r["overlayPaints"] if not x.startswith("rgba(0, 0, 0, 0)|none")]
        ok = (
            r["identityOk"]
            and r["minMean"] >= 12
            and r["maxDarkPercent"] <= 90
            and not opaque
            and r["settledState"] is None
            and r["settledOverlays"] == 0
        )
        failures += 0 if ok else 1
        print(
            f"{'PASS' if ok else 'FAIL'} {r['direction']:8s} ->{r['target']:11s} "
            f"{r['identity']} ok={r['identityOk']} minMean={r['minMean']} "
            f"dark={r['maxDarkPercent']}% settled={r['settledState']} "
            f"overlays={r['settledOverlays']} overflowX={r['overflowX']}"
        )
    print(f"failures={failures}")


asyncio.run(main())
