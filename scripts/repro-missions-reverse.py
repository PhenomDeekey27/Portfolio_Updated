"""Reproduce Missions -> Skills reverse scrolling with REAL wheel input.

Drives the page with actual mouse-wheel events (no programmatic scrollTo),
samples the viewport every frame, and reports every frame whose mean luminance
drops into "black viewport" territory, together with the transition state at
that moment.

Usage: python scripts/repro-missions-reverse.py [label] [width] [height]
"""

import asyncio
import io
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "repro"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = f"screenshots/phase55/{LABEL}"

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  const missions = document.getElementById('missions');
  const skills = document.getElementById('skills');
  const experience = document.getElementById('experience');
  return {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    dir: ov ? ov.getAttribute('data-teleport-direction') : null,
    y: Math.round(window.scrollY),
    missionsTop: missions ? Math.round(missions.getBoundingClientRect().top) : null,
    skillsBottom: skills ? Math.round(skills.getBoundingClientRect().bottom) : null,
    experienceTop: experience ? Math.round(experience.getBoundingClientRect().top) : null,
  };
}"""


def luminance(png_bytes):
    im = Image.open(io.BytesIO(png_bytes)).convert("L")
    im = im.resize((80, 45))
    px = list(im.getdata())
    mean = sum(px) / len(px)
    # share of the viewport that is near-black
    dark = sum(1 for v in px if v < 12) / len(px)
    return mean, dark


async def settle(page, timeout=4000):
    """Wait until no teleport sequence is running."""
    waited = 0
    while waited < timeout:
        st = await page.evaluate(STATE_JS)
        if st["state"] is None:
            return
        await page.wait_for_timeout(60)
        waited += 60
    return


async def main():
    os.makedirs(OUT, exist_ok=True)
    frames = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        # Skip the intro sequence.
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1200)

        # --- real forward scrolling until the Missions section tops out -------
        prev_state = None
        for i in range(220):
            st = await page.evaluate(STATE_JS)
            if st["state"] and st["state"] != prev_state:
                prev_state = st["state"]
            if st["state"] is None and st["missionsTop"] is not None and st["missionsTop"] < 120:
                break
            await page.mouse.wheel(0, 420)
            await page.wait_for_timeout(90)
            # a transition locked scrolling: wait it out
            await settle(page, 3000)
        await page.wait_for_timeout(1400)
        before = await page.evaluate(STATE_JS)
        print("arrived missions:", json.dumps(before), flush=True)
        await page.screenshot(path=f"{OUT}/00-missions-arrived.png")

        # --- reverse scrolling while sampling every frame ---------------------
        t = 0

        async def sample():
            nonlocal t
            st = await page.evaluate(STATE_JS)
            shot = await page.screenshot()
            mean, dark = luminance(shot)
            frames.append(
                {
                    "i": len(frames),
                    "t": t,
                    "mean": round(mean, 2),
                    "dark": round(dark * 100, 1),
                    **st,
                }
            )
            with open(f"{OUT}/f{len(frames) - 1:03d}.png", "wb") as fh:
                fh.write(shot)
            t += 60
            return st

        # Phase 1: small backward wheel steps until the reverse identity starts.
        started = False
        for _ in range(60):
            await page.mouse.wheel(0, -180)
            await page.wait_for_timeout(40)
            st = await sample()
            if st["state"]:
                started = True
                break

        # Phase 2: record the whole sequence without touching the wheel
        # (scrolling is locked during the transition, so extra wheels would
        # not change anything and would only delay sampling).
        if started:
            for _ in range(60):  # ~3.5s of frames
                await page.wait_for_timeout(20)
                await sample()
        else:
            print("WARNING: reverse transition never started", flush=True)

        await settle(page, 4000)
        after = await page.evaluate(STATE_JS)
        print("after reverse:", json.dumps(after), flush=True)
        await page.screenshot(path=f"{OUT}/99-after-reverse.png")
        await browser.close()

    with open(f"{OUT}/timeline.json", "w") as fh:
        json.dump(frames, fh, indent=1)

    black = [f for f in frames if f["mean"] < 14]
    print(f"\nframes={len(frames)} black_frames={len(black)}")
    for f in frames:
        flag = "BLACK" if f["mean"] < 14 else ("dim  " if f["mean"] < 30 else "ok   ")
        print(
            f"{f['i']:03d} {flag} mean={f['mean']:6.2f} dark={f['dark']:5.1f}% "
            f"state={f['state']} testid={f['testid']} y={f['y']} "
            f"missTop={f['missionsTop']} skillsBottom={f['skillsBottom']}"
        )


asyncio.run(main())
