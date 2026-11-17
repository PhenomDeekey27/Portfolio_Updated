"""Acceptance pass: real wheel scrolling through every route, both directions.

Records viewport luminance on every frame of every transition, checks the
transition identity for each route, and saves a few key frames per route.

Usage: python scripts/verify-transitions.py <label> <width> <height> [cpu_throttle]
"""

import asyncio
import io
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "pass"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
CPU = int(sys.argv[4]) if len(sys.argv) > 4 else 0
OUT = f"screenshots/phase55/{LABEL}"

# section id -> expected transition identity for the route that lands on it
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

ORDER = ["home", "about", "skills", "missions", "experience", "contact"]

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  const veil = document.querySelector('.world-veil');
  const out = {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    dir: ov ? ov.getAttribute('data-teleport-direction') : null,
    y: Math.round(window.scrollY),
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    overlayCount: document.querySelectorAll('[data-teleport-state]').length,
    overlayPaint: ov ? getComputedStyle(ov).backgroundColor + '|' + getComputedStyle(ov).backgroundImage : null,
    veilPaint: veil ? getComputedStyle(veil).backgroundColor + '|' + getComputedStyle(veil).backgroundImage.slice(0, 24) : null,
    veilClip: veil ? getComputedStyle(veil).clipPath : null,
  };
  for (const id of ['home','about','skills','missions','experience','contact']) {
    const el = document.getElementById(id);
    out[id + 'Top'] = el ? Math.round(el.getBoundingClientRect().top) : null;
    out[id + 'Bottom'] = el ? Math.round(el.getBoundingClientRect().bottom) : null;
  }
  const content = document.querySelector('[data-section-content]');
  out.contentPhase = content ? content.getAttribute('data-reveal-phase') : null;
  return out;
}"""

SAMPLING_JS = """() => new Promise((resolve) => {
  const frames = [];
  let last = performance.now();
  let running = true;
  const tick = (t) => {
    frames.push(Math.round(t - last));
    last = t;
    if (running) requestAnimationFrame(tick);
    else resolve(frames);
  };
  requestAnimationFrame(tick);
  window.__stopSampling = () => { running = false; };
})"""


def luminance(png_bytes):
    im = Image.open(io.BytesIO(png_bytes)).convert("L")
    im = im.resize((80, 45))
    px = list(im.getdata())
    mean = sum(px) / len(px)
    dark = sum(1 for v in px if v < 12) / len(px)
    return round(mean, 2), round(dark * 100, 1)


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"label": LABEL, "viewport": [W, H], "cpuThrottle": CPU, "routes": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})
        if CPU:
            client = await page.context.new_cdp_session(page)
            await client.send("Emulation.setCPUThrottlingRate", {"rate": CPU})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1400)

        async def settle(timeout=6000):
            waited = 0
            while waited < timeout:
                st = await page.evaluate(STATE_JS)
                if st["state"] is None:
                    return st
                await page.wait_for_timeout(60)
                waited += 60
            return await page.evaluate(STATE_JS)

        async def sample(tag=None, save=False):
            st = await page.evaluate(STATE_JS)
            if save:
                shot = await page.screenshot(type="png")
                with open(f"{OUT}/{tag}.png", "wb") as fh:
                    fh.write(shot)
                return {**st, "mean": 0.0, "dark": 0.0}
            # jpeg keeps the luminance probe cheap enough to sample densely
            shot = await page.screenshot(type="jpeg", quality=30)
            mean, dark = luminance(shot)
            return {**st, "mean": mean, "dark": dark}

        async def run_route(target, direction, expected):
            """Wheel until the target transition starts, then record it."""
            frames = []
            key = {}
            triggered = False
            vel = 180 if direction == "forward" else -180

            # Phase 1: creep toward the boundary.
            for _ in range(60):
                await page.mouse.wheel(0, vel)
                await page.wait_for_timeout(35)
                st = await sample()
                frames.append(st)
                if st["state"]:
                    triggered = True
                    break

            if not triggered:
                return {"target": target, "direction": direction, "error": "transition never started",
                        "frames": frames}

            ident = frames[-1]["testid"]
            # Phase 2: record the full sequence as densely as possible.
            saved = set()
            for _ in range(34):
                await page.wait_for_timeout(15)
                st = await sample()
                frames.append(st)
                if (
                    target in ("skills", "experience")
                    and st["state"] in ("COVERING", "WORLD_SWITCH", "ARRIVAL")
                    and st["state"] not in saved
                ):
                    saved.add(st["state"])
                    await page.screenshot(
                        path=f"{OUT}/{direction}-{target}-{st['state']}.png"
                    )
                if st["state"] == "WORLD_SWITCH":
                    key.setdefault("world", len(frames) - 1)
                if st["state"] == "ARRIVAL":
                    key.setdefault("arrival", len(frames) - 1)
                if st["state"] is None and "arrival" in key:
                    break

            await page.wait_for_timeout(700)
            final = await sample()
            await page.screenshot(path=f"{OUT}/{direction}-{target}-settled.png")

            probed = [f for f in frames if f["state"] and f["mean"] > 0]
            seq = [f for f in frames if f["state"]]
            means = [f["mean"] for f in probed] or [0]
            darks = [f["dark"] for f in probed] or [100]
            overlay_paints = {f["overlayPaint"] for f in seq if f["overlayPaint"]}
            return {
                "target": target,
                "direction": direction,
                "identity": ident,
                "identityOk": ident == expected,
                "framesInSequence": len(seq),
                "probedInSequence": len(probed),
                "minMean": min(means),
                "maxDarkPercent": max(darks),
                "states": sorted({f["state"] for f in seq}),
                "settledState": final["state"],
                "settledOverlays": final["overlayCount"],
                "overflowX": final["overflowX"],
                "overlayPaints": sorted(overlay_paints),
                "statesDuring": [f["state"] for f in seq],
                "means": means,
            }

        # --- Forward pass -------------------------------------------------
        for target, expected in FORWARD:
            result = await run_route(target, "forward", expected)
            print(json.dumps({k: v for k, v in result.items() if k not in ("statesDuring", "means")}), flush=True)
            report["routes"].append(result)
            await settle()
            await page.wait_for_timeout(900)

        # --- Backward pass ------------------------------------------------
        for target, expected in BACKWARD:
            result = await run_route(target, "backward", expected)
            print(json.dumps({k: v for k, v in result.items() if k not in ("statesDuring", "means")}), flush=True)
            report["routes"].append(result)
            await settle()
            await page.wait_for_timeout(900)

        # --- Scroll performance sample (real wheel, current position) ------
        sampler = asyncio.create_task(page.evaluate(SAMPLING_JS))
        for _ in range(14):
            await page.mouse.wheel(0, 260)
            await page.wait_for_timeout(80)
        await page.evaluate("window.__stopSampling && window.__stopSampling()")
        frame_ms = await sampler
        await settle()
        frame_ms = [f for f in frame_ms if f > 0][2:]
        if frame_ms:
            ordered = sorted(frame_ms)
            report["scrollPerf"] = {
                "frames": len(frame_ms),
                "avgMs": round(sum(frame_ms) / len(frame_ms), 1),
                "p95Ms": ordered[int(len(ordered) * 0.95) - 1],
                "worstMs": ordered[-1],
            }
        await browser.close()

    with open(f"{OUT}/report.json", "w") as fh:
        json.dump(report, fh, indent=2)

    print("\n=== SUMMARY ===")
    failures = 0
    for r in report["routes"]:
        if r.get("error"):
            failures += 1
            print(f"FAIL  {r['direction']:8s} -> {r['target']:11s} {r['error']}")
            continue
        bad = r["minMean"] < 12 and r["maxDarkPercent"] > 90
        opaque = [p for p in r.get("overlayPaints", []) if not p.startswith("rgba(0, 0, 0, 0)|none")]
        if opaque:
            print("OPAQUE OVERLAY ROOT:", opaque)
        ok = (
            r["identityOk"]
            and not bad
            and not opaque
            and r["settledState"] is None
            and r["settledOverlays"] == 0
        )
        if not ok:
            failures += 1
        print(
            f"{'PASS' if ok else 'FAIL'}  {r['direction']:8s} -> {r['target']:11s} "
            f"identity={r['identity']} ok={r['identityOk']} "
            f"samples={r.get('probedInSequence')}/{r['framesInSequence']} "
            f"minMean={r['minMean']:.1f} maxDark={r['maxDarkPercent']:.1f}% "
            f"settled={r['settledState']} overlays={r['settledOverlays']} overflowX={r['overflowX']}"
        )
    print("scrollPerf:", json.dumps(report.get("scrollPerf")))
    print(f"failures={failures}")


asyncio.run(main())
