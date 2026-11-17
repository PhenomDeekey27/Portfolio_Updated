"""PHASE 6.7 — revised BugWiser evidence capture and checks.

Each sand beat is captured by pausing the running CSS animations at a target
time on the bank timeline, so the frame matches the requested moment instead of
whatever the screenshot encoder happened to reach.

Moments:
  00-initial ......... dark scene settles
  01-gather .......... fine grains and sand gathering from the edges
  02-sand-curtain .... the two formations close across the viewport
  03-sand-split ...... the curtain parts from the centre
  04-title ........... BUGWISER emerging through the opening
  05-introduction .... problem and audience copy in the settled scene
  06-carousel ........ large floating application deck
  07-autoplay ........ automatic change after ~2.5s
  08-manual .......... previous/next navigation
  08b-record-head .... editorial record opener
  09-overview ........ what BugWiser is
  10-who ............. who it helps
  11-features ........ implemented capabilities
  12-technology ...... stack and verified links
  reduced-* .......... static stage, autoplay off, manual navigation

Also records autoplay intervals, hover and keyboard-focus hold, touch swipe,
image loading/aspect, horizontal overflow and reduced-motion state.

Usage: BASE=http://localhost:3001 python scripts/capture-bugwiser-phase67.py [1920|1366|390]
"""

import asyncio
import json
import os
import sys
import time

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = os.path.join("screenshots", "phase67", "rework")
ALL_VIEWPORTS = [("1920", 1920, 1080), ("1366", 1366, 768), ("390", 390, 844)]
ONLY = sys.argv[1] if len(sys.argv) > 1 else None
VIEWPORTS = [v for v in ALL_VIEWPORTS if not ONLY or v[0] == ONLY]

STAGE_BEATS = [
    ("00-initial", 250),
    ("01-gather", 900),
    ("02-sand-curtain", 1650),
    ("03-sand-split", 2350),
    ("04-title", 3050),
]

STATE_JS = """() => {
  const q = (s) => document.querySelector(s);
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const img = q('.bw-slide.is-active img');
  return {
    viewport: [window.innerWidth, window.innerHeight],
    active: q('[data-encounter="bugwiser"]')?.dataset.active || null,
    stage: r(q('.bw-stage')),
    title: r(q('#bw-title')),
    titleFont: q('.bw-title') ? getComputedStyle(q('.bw-title')).fontSize : null,
    titleOpacity: q('.bw-title-text') ? getComputedStyle(q('.bw-title-text')).opacity : null,
    titleClip: q('.bw-title-text') ? getComputedStyle(q('.bw-title-text')).clipPath : null,
    introOpacity: q('.bw-intro') ? getComputedStyle(q('.bw-intro')).opacity : null,
    notesOpacity: q('.bw-stage-notes') ? getComputedStyle(q('.bw-stage-notes')).opacity : null,
    sandSheet: q('.bw-wave-upper') ? getComputedStyle(q('.bw-wave-upper')).transform + ' | ' + getComputedStyle(q('.bw-wave')).opacity : null,
    count: q('.bw-carousel-count')?.textContent?.trim() || null,
    status: q('.bw-autoplay-status')?.textContent?.trim() || null,
    deck: r(q('.bw-deck')),
    frame: r(q('.bw-slide.is-active .bw-slide-frame')),
    image: r(img),
    imageSrc: img?.currentSrc?.split('/').pop() || null,
    imageNatural: img ? [img.naturalWidth, img.naturalHeight] : null,
    imageLoaded: !!img && img.complete && img.naturalWidth > 0,
    slides: document.querySelectorAll('.bw-slide').length,
    controls: r(q('.bw-controls')),
    dots: document.querySelectorAll('.bw-dot').length,
    gallery: r(q('#bw-gallery')),
    record: r(q('#bw-record')),
    recordActions: [...document.querySelectorAll('.bw-access-link')].map((a) => a.getAttribute('href')),
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}"""


async def load(page):
    await page.goto(BASE + "/", wait_until="domcontentloaded")
    await page.wait_for_timeout(900)
    skip = page.get_by_role("button", name="Skip intro")
    if await skip.count():
        try:
            await skip.first.click(timeout=2000)
        except Exception:
            pass
        await page.wait_for_timeout(400)


async def scroll_to(page, selector, offset=90):
    await page.evaluate(
        """([selector, offset]) => {
            const el = document.querySelector(selector);
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' });
        }""",
        [selector, offset],
    )


async def activate_encounter(page):
    await scroll_to(page, '[data-encounter="bugwiser"]', 30)
    try:
        await page.wait_for_function(
            """() => document.querySelector('[data-encounter="bugwiser"]')?.dataset.active === 'true'""",
            timeout=15000,
        )
    except Exception:
        pass
    await scroll_to(page, ".bw-stage", 0)


async def freeze_at(page, target):
    return await page.evaluate(
        """(target) => new Promise((resolve) => {
            const el = document.querySelector('.bw-wave-upper');
            const animation = el?.getAnimations?.()[0];
            if (!animation) { resolve(null); return; }
            const id = setInterval(() => {
              if (animation.currentTime >= target) {
                document.getAnimations().forEach((entry) => entry.pause());
                clearInterval(id);
                resolve(Math.round(animation.currentTime));
              }
            }, 12);
        })""",
        target,
    )


async def stage_beat(browser, label, width, height, name, target):
    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    await activate_encounter(page)
    actual = await freeze_at(page, target)
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)
    await page.screenshot(path=os.path.join(folder, f"scene-{name}.png"))
    state = await page.evaluate(STATE_JS)
    await context.close()
    return {"name": name, "target": target, "actual": actual, "state": state, "errors": errors}


async def settled_scene(browser, label, width, height):
    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    await activate_encounter(page)
    await page.wait_for_timeout(4700)
    await page.evaluate("() => document.getAnimations().forEach((entry) => entry.pause())")
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)
    await page.screenshot(path=os.path.join(folder, "scene-05-introduction.png"))
    state = await page.evaluate(STATE_JS)
    await context.close()
    return {"state": state, "errors": errors}


async def carousel_scene(browser, label, width, height):
    context = await browser.new_context(
        viewport={"width": width, "height": height}, has_touch=width < 700
    )
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    await scroll_to(page, ".bw-deck", 90)
    await page.mouse.move(3, 3)
    await page.wait_for_timeout(700)
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)

    def count_text():
        return page.evaluate("() => document.querySelector('.bw-carousel-count')?.textContent?.trim()")

    # Automatic advance: measure the interval between three changes.
    changes = []
    last = await count_text()
    deadline = time.monotonic() + 9.0
    while time.monotonic() < deadline and len(changes) < 3:
        await page.wait_for_timeout(50)
        current = await count_text()
        if current != last:
            changes.append(time.monotonic())
            last = current
    intervals = [round((changes[i] - changes[i - 1]) * 1000) for i in range(1, len(changes))]

    await page.wait_for_timeout(700)
    before = await page.evaluate(STATE_JS)
    neighbours = await page.evaluate(
        """() => {
          const active = document.querySelector('.bw-slide.is-active')?.getBoundingClientRect();
          if (!active) return [];
          return [...document.querySelectorAll('.bw-slide:not(.is-active)')].map((slide) => {
            const r = slide.getBoundingClientRect();
            const visibleLeft = Math.max(r.x, 0);
            const visibleRight = Math.min(r.right, innerWidth);
            const leftPeek = Math.max(0, Math.min(visibleRight, active.x) - visibleLeft);
            const rightPeek = Math.max(0, visibleRight - Math.max(visibleLeft, active.right));
            return {
              exposed: Math.round(leftPeek + rightPeek),
              opacity: Number(getComputedStyle(slide).opacity),
              width: Math.round(r.width),
            };
          });
        }"""
    )
    await page.screenshot(path=os.path.join(folder, "scene-06-carousel.png"))

    await page.wait_for_timeout(2600)
    after = await page.evaluate(STATE_JS)
    await page.screenshot(path=os.path.join(folder, "scene-07-autoplay.png"))

    # Hover hold.
    box = await page.locator(".bw-deck").bounding_box()
    if box:
        await page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    hover_before = await page.evaluate(STATE_JS)
    await page.wait_for_timeout(2800)
    hover_after = await page.evaluate(STATE_JS)
    await page.mouse.move(3, 3)
    await page.wait_for_timeout(300)

    # Manual next.
    manual_before = await page.evaluate(STATE_JS)
    await page.locator(".bw-control").last.scroll_into_view_if_needed()
    await page.locator(".bw-control").last.click()
    await page.wait_for_timeout(900)
    manual_after = await page.evaluate(STATE_JS)
    await scroll_to(page, ".bw-deck", 90)
    await page.mouse.move(3, 3)
    await page.screenshot(path=os.path.join(folder, "scene-08-manual.png"))

    # Touch swipe (mobile only).
    touch_before = await count_text()
    touched = None
    if width < 700 and box:
        client = await context.new_cdp_session(page)
        await scroll_to(page, ".bw-deck", 90)
        fresh = await page.locator(".bw-deck").bounding_box()
        if fresh:
            y = fresh["y"] + fresh["height"] / 2
            await client.send(
                "Input.dispatchTouchEvent",
                {"type": "touchStart", "touchPoints": [{"x": fresh["x"] + fresh["width"] * 0.8, "y": y}]},
            )
            await client.send(
                "Input.dispatchTouchEvent",
                {"type": "touchMove", "touchPoints": [{"x": fresh["x"] + fresh["width"] * 0.3, "y": y}]},
            )
            await client.send(
                "Input.dispatchTouchEvent",
                {"type": "touchEnd", "touchPoints": []},
            )
            await page.wait_for_timeout(700)
            touched = await count_text()

    await context.close()
    return {
        "intervals": intervals,
        "neighbours": neighbours,
        "neighboursFloating": bool(neighbours)
        and all(n["exposed"] >= 8 and n["opacity"] >= 0.4 for n in neighbours),
        "beforeCount": before["count"],
        "afterCount": after["count"],
        "autoplayAdvanced": before["count"] != after["count"],
        "hoverStatus": hover_after["status"],
        "hoverHeld": hover_before["count"] == hover_after["count"],
        "manualBefore": manual_before["count"],
        "manualAfter": manual_after["count"],
        "manualAdvanced": manual_before["count"] != manual_after["count"],
        "touchBefore": touch_before,
        "touchAfter": touched,
        "touchAdvanced": touched is not None and touched != touch_before,
        "state": before,
        "afterState": after,
        "errors": errors,
    }


async def keyboard_check(browser, width, height):
    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    await load(page)
    await scroll_to(page, ".bw-deck", 90)
    await page.mouse.move(2, 2)
    await page.wait_for_timeout(500)
    focused = False
    for _ in range(30):
        await page.keyboard.press("Tab")
        if await page.evaluate(
            "() => document.activeElement?.classList?.contains('bw-carousel')"
        ):
            focused = True
            break
    state = await page.evaluate(
        """() => ({
            focusVisible: document.activeElement?.matches?.(':focus-visible') ?? false,
            status: document.querySelector('.bw-autoplay-status')?.textContent?.trim(),
            count: document.querySelector('.bw-carousel-count')?.textContent?.trim(),
        })"""
    )
    before = state["count"]
    await page.wait_for_timeout(2800)
    held = await page.evaluate(
        "() => document.querySelector('.bw-carousel-count')?.textContent?.trim()"
    )
    await page.keyboard.press("ArrowRight")
    await page.wait_for_timeout(400)
    after = await page.evaluate(
        "() => document.querySelector('.bw-carousel-count')?.textContent?.trim()"
    )
    await context.close()
    return {
        "focused": focused,
        "focusVisible": state["focusVisible"],
        "status": state["status"],
        "before": before,
        "held": held,
        "heldWhileFocused": before == held,
        "arrowAdvanced": before != after,
        "after": after,
    }


async def story_scene(browser, label, width, height):
    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)

    captures = [
        ("#bw-record", "scene-08b-record-head.png"),
        ("#bw-what", "scene-09-overview.png"),
        ("#bw-who", "scene-10-who.png"),
        ("#bw-features", "scene-11-features.png"),
        ("#bw-access", "scene-12-technology.png"),
    ]
    states = {}
    for selector, filename in captures:
        await scroll_to(page, selector, 90)
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(folder, filename))
        states[filename] = await page.evaluate(STATE_JS)
    await context.close()
    return states, errors


async def reduced_scene(browser, label, width, height):
    context = await browser.new_context(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)

    await scroll_to(page, ".bw-stage", 0)
    await page.wait_for_timeout(700)
    stage = await page.evaluate(STATE_JS)
    studio = await page.evaluate(
        """() => ({
            sheetDisplay: getComputedStyle(document.querySelector('.bw-wave')).display,
            runningAnimations: document.getAnimations().filter((entry) =>
              entry.playState === 'running' && entry.effect?.target?.closest?.('[data-encounter="bugwiser"]')
            ).length,
        })"""
    )
    await page.screenshot(path=os.path.join(folder, "reduced-01-stage.png"))

    await scroll_to(page, ".bw-deck", 90)
    await page.wait_for_timeout(600)
    before = await page.evaluate(STATE_JS)
    await page.wait_for_timeout(5200)
    after = await page.evaluate(STATE_JS)
    await page.screenshot(path=os.path.join(folder, "reduced-02-carousel.png"))

    await page.locator(".bw-control").last.click()
    await page.wait_for_timeout(500)
    manual = await page.evaluate(STATE_JS)

    await scroll_to(page, "#bw-access", 90)
    await page.wait_for_timeout(800)
    access = await page.evaluate(STATE_JS)
    await page.screenshot(path=os.path.join(folder, "reduced-03-record.png"))
    await context.close()

    return {
        "titleOpacity": stage["titleOpacity"],
        "titleClip": stage["titleClip"],
        "introOpacity": stage["introOpacity"],
        "notesOpacity": stage["notesOpacity"],
        "sheetDisplay": studio["sheetDisplay"],
        "runningAnimations": studio["runningAnimations"],
        "autoplayBefore": before["count"],
        "autoplayAfter": after["count"],
        "autoplayOff": before["count"] == after["count"],
        "status": after["status"],
        "manualBefore": after["count"],
        "manualAfter": manual["count"],
        "manualAdvanced": after["count"] != manual["count"],
        "recordActions": access["recordActions"],
        "errors": errors,
    }


async def responsive_check(browser, label, width, height):
    os.makedirs(os.path.join(OUT, label), exist_ok=True)
    context = await browser.new_context(
        viewport={"width": width, "height": height}, has_touch=True
    )
    page = await context.new_page()
    await load(page)
    await activate_encounter(page)
    await page.wait_for_timeout(600)
    stage = await page.evaluate(STATE_JS)
    await page.screenshot(path=os.path.join(OUT, label, f"viewport-{width}x{height}-stage.png"))
    await scroll_to(page, ".bw-deck", 84)
    await page.wait_for_timeout(500)
    deck = await page.evaluate(STATE_JS)
    await context.close()
    return {"stage": stage, "deck": deck}


async def run(browser, label, width, height):
    beats = []
    errors = []
    for name, target in STAGE_BEATS:
        beat = await stage_beat(browser, label, width, height, name, target)
        beats.append(beat)
        errors += beat["errors"]
    settled = await settled_scene(browser, label, width, height)
    errors += settled["errors"]
    carousel = await carousel_scene(browser, label, width, height)
    keyboard = await keyboard_check(browser, width, height)
    story, story_errors = await story_scene(browser, label, width, height)
    reduced = await reduced_scene(browser, label, width, height)
    errors += story_errors + carousel["errors"] + reduced["errors"]

    return {
        "label": label,
        "viewport": [width, height],
        "stage": {"beats": beats, "settled": settled["state"]},
        "carousel": carousel,
        "keyboard": keyboard,
        "story": story,
        "reduced": reduced,
        "errors": errors,
    }


async def main():
    os.makedirs(OUT, exist_ok=True)
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, width, height in VIEWPORTS:
            result = await run(browser, label, width, height)
            results.append(result)
            print(
                json.dumps(
                    {
                        "label": label,
                        "intervals": result["carousel"]["intervals"],
                        "autoplay": result["carousel"]["autoplayAdvanced"],
                        "hoverHeld": result["carousel"]["hoverHeld"],
                        "manual": result["carousel"]["manualAdvanced"],
                        "touch": result["carousel"]["touchAdvanced"],
                        "keyboardHeld": result["keyboard"]["heldWhileFocused"],
                        "arrow": result["keyboard"]["arrowAdvanced"],
                        "reducedOff": result["reduced"]["autoplayOff"],
                        "reducedManual": result["reduced"]["manualAdvanced"],
                        "errors": result["errors"],
                    }
                ),
                flush=True,
            )
        if not ONLY:
            for label, width, height in [("375", 375, 812), ("430", 430, 932)]:
                results.append(await responsive_check(browser, label, width, height))
        await browser.close()

    report_name = f"report-{ONLY}.json" if ONLY else "report.json"
    with open(os.path.join(OUT, report_name), "w") as handle:
        json.dump(results, handle, indent=1)
    print(json.dumps(results, indent=1)[:4000])


asyncio.run(main())
