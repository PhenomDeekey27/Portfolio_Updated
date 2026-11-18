"""PHASE 6.18 — is the BugWiser phone animation actually blinking?

Technical checks say the sand sequence fits the frame budget, yet on a phone it
"blinks". Frame timing alone cannot show that, so this probe records the actual
compositor output with a CDP screencast and looks at what was painted:

  * mean luminance per frame, and the largest jump between consecutive frames —
    a blink is a large, fast change that is not part of a gradient (the sand
    wave fades in and out slowly, so a 30% step in under a frame is a defect);
  * delivered fps, for the frame budget;
  * the animations reported by `document.getAnimations()` during the sequence,
    so the cost can be attributed to a layer or a timeline.

    python scripts/probe-phase618-flicker.py [--url ...] [--tag before]

Output: screenshots/phase618/flicker-<tag>.json
"""

import argparse
import asyncio
import base64
import io
import json
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

STAGE = "[data-encounter='bugwiser'] .bw-stage"



# The pre-6.18 phone properties, re-applied at runtime so both variants are
# measured on the same build.
LEGACY_CSS = """
@media (max-width: 1023px) {
  .bw-mote { will-change: transform, opacity; }
  .bw-haze, .bw-aura, .bw-swirl, .bw-dune, .bw-grain, .bw-ribbon-speckle {
    mix-blend-mode: screen;
  }
  .bw[data-active="true"] .bw-ribbon {
    animation-name: bw-ribbon-draw;
    animation-timing-function: cubic-bezier(0.22, 0.7, 0.2, 1);
    animation-fill-mode: both;
    animation-duration: 1500ms;
    stroke-dashoffset: 1;
    opacity: 0;
  }
}
"""


async def run(url: str, width: int, height: int, cpu: int, legacy: bool) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=1,
            is_mobile=width < 1024,
            has_touch=width < 1024,
        )
        page = await context.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(600)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(800)

        if legacy:
            await page.add_style_tag(content=LEGACY_CSS)
            await page.wait_for_timeout(200)

        await page.evaluate(
            """(selector) => {
                const el = document.querySelector(selector);
                const y = el.getBoundingClientRect().top + window.scrollY - 40;
                window.scrollTo({ top: y, behavior: 'instant' });
            }""",
            STAGE,
        )
        # Let the encounter arm, then rewind the technique by leaving and
        # re-entering is not needed: the stage arms once here.
        await page.wait_for_timeout(500)

        client = await context.new_cdp_session(page)
        if cpu > 1:
            await client.send("Emulation.setCPUThrottlingRate", {"rate": cpu})

        frames = []

        def on_frame(params):
            frames.append(params)
            asyncio.ensure_future(
                client.send("Page.screencastFrameAck", {"sessionId": params["sessionId"]})
            )

        client.on("Page.screencastFrame", on_frame)
        await client.send(
            "Page.startScreencast",
            {"format": "jpeg", "quality": 55, "maxWidth": width, "maxHeight": height, "everyNthFrame": 1},
        )
        await page.wait_for_timeout(4200)
        await client.send("Page.stopScreencast")

        animations = await page.evaluate(
            """() => document.getAnimations()
                .filter((a) => a.playState === 'running')
                .map((a) => a.animationName || (a.effect && a.effect.pseudoElement) || 'transition')
            """
        )
        active = await page.evaluate(
            "(selector) => document.querySelector(selector)?.closest('[data-active]')?.dataset.active",
            STAGE,
        )

        await browser.close()

    lums = []
    for frame in frames:
        data = base64.b64decode(frame["data"])
        with Image.open(io.BytesIO(data)) as im:
            grey = im.convert("L").resize((48, 96))
            pixels = list(grey.getdata())
            lums.append(round(sum(pixels) / len(pixels), 2))

    deltas = [
        {"i": i, "delta": round(abs(lums[i] - lums[i - 1]), 2)}
        for i in range(1, len(lums))
    ]
    deltas.sort(key=lambda d: d["delta"], reverse=True)

    elapsed = 4.2
    return {
        "variant": "legacy" if legacy else "current",
        "viewport": [width, height],
        "cpuThrottle": cpu,
        "stageActive": active,
        "frames": len(frames),
        "fps": round(len(frames) / elapsed, 1),
        "luminance": lums,
        "largestSteps": deltas[:6],
        "runningAnimations": sorted(set(animations)),
    }


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:3100")
    parser.add_argument("--tag", default="before")
    parser.add_argument("--runs", type=int, default=3)
    args = parser.parse_args()

    report = {"phone": [], "small": []}
    for _ in range(args.runs):
        for name, width, height in (("phone", 390, 844), ("small", 320, 655)):
            for legacy in (True, False):
                report[name].append(await run(args.url, width, height, 4, legacy))

    summary = {}
    for name, rows in report.items():
        for variant in ("legacy", "current"):
            picks = [r for r in rows if r["variant"] == variant]
            fps = sorted(r["fps"] for r in picks)
            steps = sorted(r["largestSteps"][0]["delta"] for r in picks if r["largestSteps"])
            summary[f"{name}-{variant}"] = {
                "runs": len(picks),
                "fpsSamples": fps,
                "fpsMedian": fps[len(fps) // 2],
                "maxStepSamples": steps,
                "maxStepMedian": steps[len(steps) // 2] if steps else None,
                "animations": sorted({a for r in picks for a in r["runningAnimations"]}),
            }

    out = Path("screenshots/phase618")
    out.mkdir(parents=True, exist_ok=True)
    path = out / f"flicker-{args.tag}.json"
    path.write_text(json.dumps({"summary": summary, "runs": report}, indent=2), encoding="utf-8")
    for key, row in summary.items():
        print(key, "fps", row["fpsMedian"], row["fpsSamples"],
              "maxStep", row["maxStepMedian"], row["maxStepSamples"])


asyncio.run(main())
