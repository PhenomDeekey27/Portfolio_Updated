"""Reverse-scroll position probe.

Drives the page with REAL wheel input, walks forward to Experience (so the
teleport controller's active section is established), then reverses through
Experience -> Missions -> Skills -> About -> Home while recording the scroll
position and teleport state on every sample.

Reports, per reverse route:
  triggerY — scrollY when the sequence started
  snapY    — scrollY right after the TELEPORT_FLASH snap
  endY     — scrollY once the sequence returned to IDLE
  jump     — endY - triggerY (negative = page moved up)
  destTopAtEnd / destBottomAtEnd — destination section edges in viewport coords

Usage: BASE=http://localhost:3001 python scripts/probe-reverse-scroll.py <label> <w> <h>
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "probe"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
H = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = f"screenshots/phase65/probe/{LABEL}"

ROUTES = [
    ("experience", "missions"),
    ("skills", "missions"),  # wait-reverse: handled below by source/dest pairs
]

# Reverse routes in the order the visitor meets them while scrolling up.
REVERSE = [
    ("experience", "missions", "shinobi-map"),
    ("missions", "skills", "rasengan"),
    ("skills", "about", "nature-chakra"),
    ("about", "home", "raijin"),
]

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  const ids = ['home','about','skills','missions','experience','contact'];
  const rects = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    rects[id] = { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
  }
  return {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    y: Math.round(window.scrollY),
    maxY: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    vh: window.innerHeight,
    overflow: getComputedStyle(document.documentElement).overflow,
    rects,
  };
}"""


async def state(page):
    return await page.evaluate(STATE_JS)


async def wait_idle(page, timeout=5000):
    waited = 0
    while waited < timeout:
        st = await state(page)
        if st["state"] is None:
            return st
        await page.wait_for_timeout(50)
        waited += 50
    return await state(page)


async def settle_after(page, ms=700):
    await page.wait_for_timeout(ms)
    return await wait_idle(page)


async def forward_to(page, target_id, log):
    """Wheel forward until `target_id` is the active, settled section."""
    for _ in range(400):
        st = await state(page)
        if st["state"] is not None:
            await wait_idle(page)
            await page.wait_for_timeout(120)
            continue
        r = st["rects"].get(target_id)
        if r and abs(r["top"]) <= 120 and st["overflow"] != "hidden":
            return st
        await page.mouse.wheel(0, 380)
        await page.wait_for_timeout(45)
    log["error"] = f"never reached {target_id}"
    return await state(page)


async def reverse_once(page, source, dest, kind, log):
    """Wheel backward until the reverse sequence starts, then follow it."""
    pre = await state(page)
    destBefore = pre["rects"][dest]
    trigger = None
    samples = []

    # Small upward wheel steps; stop the moment a sequence starts.
    for _ in range(90):
        await page.mouse.wheel(0, -160)
        await page.wait_for_timeout(35)
        st = await state(page)
        samples.append({"y": st["y"], "state": st["state"]})
        if st["state"] is not None:
            trigger = st
            break

    if trigger is None:
        log["routes"].append(
            {
                "source": source,
                "dest": dest,
                "error": "reverse transition never started",
                "preY": pre["y"],
                "destTop": destBefore["top"],
                "destBottom": destBefore["bottom"],
            }
        )
        return await state(page)

    # Follow the sequence; capture the first sample after the snap.
    snapY = None
    seen = set()
    states = []
    end = trigger
    for _ in range(80):
        st = await state(page)
        if st["state"] and st["state"] not in seen:
            seen.add(st["state"])
            states.append(st["state"])
        if st["state"] in (None, "ARRIVAL", "WORLD_SWITCH") and snapY is None:
            snapY = st["y"]
        if st["state"] is None:
            end = st
            break
        await page.wait_for_timeout(30)

    end = await settle_after(page, 900)
    destAfter = end["rects"][dest]
    log["routes"].append(
        {
            "source": source,
            "dest": dest,
            "expectedKind": kind,
            "testid": trigger["testid"],
            "states": states,
            "preY": pre["y"],
            "triggerY": trigger["y"],
            "destTopAtTrigger": destBefore["top"],
            "destBottomAtTrigger": destBefore["bottom"],
            "snapY": snapY,
            "endY": end["y"],
            "jumpFromTrigger": end["y"] - trigger["y"],
            "jumpFromPre": end["y"] - pre["y"],
            "destTopAtEnd": destAfter["top"],
            "destBottomAtEnd": destAfter["bottom"],
            "overflowAtEnd": end["overflow"],
            "maxY": end["maxY"],
        }
    )
    return end


async def main():
    os.makedirs(OUT, exist_ok=True)
    log = {"label": LABEL, "viewport": [W, H], "base": BASE, "routes": []}

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
        await page.wait_for_timeout(1000)

        st = await forward_to(page, "experience", log)
        log["arrivedExperience"] = {
            "y": st["y"],
            "experienceTop": st["rects"].get("experience", {}).get("top"),
        }
        await page.screenshot(path=f"{OUT}/00-experience-arrived.png")

        for source, dest, kind in REVERSE:
            if log.get("error"):
                break
            await reverse_once(page, source, dest, kind, log)
            await page.screenshot(path=f"{OUT}/after-{dest}.png")
            # Wait out the post-arrival cooldown before the next reverse.
            await page.wait_for_timeout(700)

        await browser.close()

    with open(f"{OUT}/reverse-scroll.json", "w") as fh:
        json.dump(log, fh, indent=1)

    print(f"== {LABEL} {W}x{H} ==")
    if log.get("error"):
        print("ERROR:", log["error"])
    for r in log["routes"]:
        if r.get("error"):
            print(f"{r['source']:>10} -> {r['dest']:<10} ERROR {r['error']}")
            continue
        print(
            f"{r['source']:>10} -> {r['dest']:<10} {r['testid']:<26} "
            f"pre={r['preY']:>6} trig={r['triggerY']:>6} snap={str(r['snapY']):>6} "
            f"end={r['endY']:>6} jump={r['jumpFromTrigger']:>7} "
            f"destTop@end={r['destTopAtEnd']:>6} destBottom@end={r['destBottomAtEnd']:>6}"
        )


asyncio.run(main())
