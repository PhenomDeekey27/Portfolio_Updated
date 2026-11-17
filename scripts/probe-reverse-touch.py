"""Reverse-scroll probe with REAL touch swipes (mobile emulation).

Uses CDP Input.dispatchTouchEvent so the page receives native touch scrolling
with momentum, then walks forward into Experience and reverses through
Experience -> Missions while recording scroll position and teleport state.

Usage: BASE=http://localhost:3001 python scripts/probe-reverse-touch.py <label> [w] [h]
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
LABEL = sys.argv[1] if len(sys.argv) > 1 else "390"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 390
H = int(sys.argv[3]) if len(sys.argv) > 3 else 844
OUT = f"screenshots/phase65/touch/{LABEL}"

STATE_JS = """() => {
  const ov = document.querySelector('[data-teleport-state]');
  const experience = document.getElementById('experience');
  const missions = document.getElementById('missions');
  const skills = document.getElementById('skills');
  return {
    state: ov ? ov.getAttribute('data-teleport-state') : null,
    testid: ov ? ov.getAttribute('data-testid') : null,
    y: Math.round(window.scrollY),
    experienceTop: experience ? Math.round(experience.getBoundingClientRect().top) : null,
    missionsBottom: missions ? Math.round(missions.getBoundingClientRect().bottom) : null,
    skillsTop: skills ? Math.round(skills.getBoundingClientRect().top) : null,
  };
}"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": W, "height": H},
            has_touch=True,
            is_mobile=True,
            device_scale_factor=2,
        )
        page = await context.new_page()
        cdp = await context.new_cdp_session(page)
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1400)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2500)
            except Exception:
                pass
        await page.wait_for_timeout(900)

        # --- forward swipes until Experience sits at the top -----------------
        reached = False
        for _ in range(30):
            st = await page.evaluate(STATE_JS)
            if st["state"] is not None:
                await page.wait_for_timeout(600)
                continue
            if st["experienceTop"] is not None and abs(st["experienceTop"]) <= 90:
                reached = True
                break
            x = W / 2
            start = H * 0.78
            end = start - H * 0.52
            await cdp.send(
                "Input.dispatchTouchEvent",
                {"type": "touchStart", "touchPoints": [{"x": x, "y": start}]},
            )
            for i in range(1, 9):
                y = start + (end - start) * i / 8
                await cdp.send(
                    "Input.dispatchTouchEvent",
                    {"type": "touchMove", "touchPoints": [{"x": x, "y": y}]},
                )
                await page.wait_for_timeout(20)
            await cdp.send(
                "Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}
            )
            await page.wait_for_timeout(650)

        arrived = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/00-experience.png")

        # --- reverse swipe until the sequence starts --------------------------
        trigger = None
        pre_idle_y = arrived["y"]
        for _ in range(12):
            x = W / 2
            start = H * 0.24
            end = start + H * 0.30
            await cdp.send(
                "Input.dispatchTouchEvent",
                {"type": "touchStart", "touchPoints": [{"x": x, "y": start}]},
            )
            for i in range(1, 7):
                y = start + (end - start) * i / 6
                await cdp.send(
                    "Input.dispatchTouchEvent",
                    {"type": "touchMove", "touchPoints": [{"x": x, "y": y}]},
                )
                await page.wait_for_timeout(22)
            await cdp.send(
                "Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}
            )
            await page.wait_for_timeout(160)
            st = await page.evaluate(STATE_JS)
            if st["state"] is not None:
                trigger = st
                break
            pre_idle_y = st["y"]
            await page.wait_for_timeout(380)

        if trigger is None:
            print(json.dumps({"error": "reverse transition never started", "arrived": arrived, "reached": reached}))
            await browser.close()
            return

        await page.screenshot(path=f"{OUT}/01-trigger.png")
        states = []
        end = trigger
        for _ in range(70):
            st = await page.evaluate(STATE_JS)
            if st["state"] and (not states or states[-1] != st["state"]):
                states.append(st["state"])
            if st["state"] is None:
                end = st
                break
            await page.wait_for_timeout(40)
        await page.wait_for_timeout(700)
        end = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/02-arrived.png")

        # --- continue swiping up: scrolling must stay responsive -------------
        before_continue = end["y"]
        x = W / 2
        start = H * 0.24
        stop = start + H * 0.34
        await cdp.send(
            "Input.dispatchTouchEvent",
            {"type": "touchStart", "touchPoints": [{"x": x, "y": start}]},
        )
        for i in range(1, 8):
            y = start + (stop - start) * i / 7
            await cdp.send(
                "Input.dispatchTouchEvent",
                {"type": "touchMove", "touchPoints": [{"x": x, "y": y}]},
            )
            await page.wait_for_timeout(22)
        await cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
        await page.wait_for_timeout(800)
        after_continue = await page.evaluate(STATE_JS)
        await page.screenshot(path=f"{OUT}/03-continued-up.png")

        overflow = await page.evaluate(
            "() => document.documentElement.scrollWidth - window.innerWidth"
        )
        locked = await page.evaluate(
            "() => getComputedStyle(document.documentElement).overflow"
        )

        report = {
            "label": LABEL,
            "viewport": [W, H],
            "reachedExperience": reached,
            "arrivedY": arrived["y"],
            "preReverseY": pre_idle_y,
            "firstObservedStateY": trigger["y"],
            "testid": trigger["testid"],
            "states": states,
            "endY": end["y"],
            "travelFromPreReverse": end["y"] - pre_idle_y,
            "missionsBottomAtEnd": end["missionsBottom"],
            "continuedUpFrom": before_continue,
            "continuedUpTo": after_continue["y"],
            "continuedUpDelta": after_continue["y"] - before_continue,
            "overflowX": overflow,
            "htmlOverflow": locked,
        }
        with open(f"{OUT}/touch-reverse.json", "w") as fh:
            json.dump(report, fh, indent=1)
        print(json.dumps(report, indent=1))
        await browser.close()


asyncio.run(main())
