"""PHASE 6.9 — ResQ Wind Release evidence capture and checks.

Captures the stage beats, the floating portrait deck, its controls and the
editorial record at each requested viewport, then writes a machine-readable
summary to screenshots/phase69/validation.json.

Usage:
    BASE=http://localhost:3001 python scripts/capture-resq-phase69.py [1920|1366|390|375|430]
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = os.path.join("screenshots", "phase69")

ALL_VIEWPORTS = [
    ("1920", 1920, 1080),
    ("1366", 1366, 768),
    ("390", 390, 844),
    ("375", 375, 812),
    ("430", 430, 932),
]
ONLY = sys.argv[1] if len(sys.argv) > 1 else None
VIEWPORTS = [v for v in ALL_VIEWPORTS if not ONLY or v[0] == ONLY]

STAGE_BEATS = [
    ("01-currents", 500),
    ("02-formation", 1300),
    ("03-pulse", 2000),
    ("04-title", 3000),
    ("05-settled", 4800),
]

STATE_JS = """() => {
  const q = (s) => document.querySelector(s);
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const img = q('.wnd-slide.is-active img');
  return {
    viewport: [innerWidth, innerHeight],
    active: q('[data-encounter="resq"]')?.dataset.active || null,
    stage: r(q('.wnd-stage')),
    title: r(q('#wnd-title')),
    titleFont: q('.wnd-title') ? getComputedStyle(q('.wnd-title')).fontSize : null,
    titleOpacity: q('.wnd-title-text') ? getComputedStyle(q('.wnd-title-text')).opacity : null,
    titleClip: q('.wnd-title-text') ? getComputedStyle(q('.wnd-title-text')).clipPath : null,
    introOpacity: q('.wnd-intro') ? getComputedStyle(q('.wnd-intro')).opacity : null,
    notesOpacity: q('.wnd-notes') ? getComputedStyle(q('.wnd-notes')).opacity : null,
    count: q('.wnd-carousel-count')?.textContent?.trim() || null,
    status: q('.wnd-autoplay-status')?.textContent?.trim() || null,
    deck: r(q('.wnd-deck')),
    frame: r(q('.wnd-slide.is-active .wnd-slide-frame')),
    imageSrc: img?.currentSrc?.split('/').pop() || null,
    imageNatural: img ? [img.naturalWidth, img.naturalHeight] : null,
    imageLoaded: !!img && img.complete && img.naturalWidth > 0,
    slides: document.querySelectorAll('.wnd-slide').length,
    dots: document.querySelectorAll('.wnd-dot').length,
    gallery: r(q('#wnd-gallery')),
    record: r(q('#wnd-record')),
    links: [...document.querySelectorAll('.wnd-link')].map((a) => a.getAttribute('href')),
    overflowX: document.documentElement.scrollWidth - innerWidth,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    background: getComputedStyle(q('.wnd-gallery') || document.body).backgroundColor,
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


async def scroll_to(page, selector, offset=0):
    await page.evaluate(
        """([s, o]) => {
            const el = document.querySelector(s);
            if (!el) return;
            window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - o, behavior: 'instant' });
        }""",
        [selector, offset],
    )


async def arm(page, selector='[data-encounter="resq"]', offset=30):
    await scroll_to(page, selector, offset)
    try:
        await page.wait_for_function(
            """() => document.querySelector('[data-encounter="resq"]')?.dataset.active === 'true'""",
            timeout=20000,
        )
    except Exception:
        pass


async def settle_images(page):
    for _ in range(24):
        pending = await page.evaluate(
            """() => [...document.querySelectorAll('.wnd-slide img, .wnd-chapter-shot img')]
                   .filter((i) => !i.complete || i.naturalWidth === 0).length"""
        )
        if pending == 0:
            return True
        await page.wait_for_timeout(250)
    return False


async def count(page):
    return (
        await page.evaluate(
            "() => document.querySelector('.wnd-carousel-count')?.textContent ?? 'missing'"
        )
    ).strip()


async def interval_samples(page, seconds=7):
    """Time each automatic change while the deck is in view."""
    samples, last, started = [], await count(page), asyncio.get_event_loop().time()
    end = started + seconds
    while asyncio.get_event_loop().time() < end:
        await page.wait_for_timeout(80)
        now = await count(page)
        if now != last:
            samples.append(round((asyncio.get_event_loop().time() - started) * 1000))
            last = now
    intervals = [samples[i] - samples[i - 1] for i in range(1, len(samples))]
    return samples, intervals


async def capture_viewport(browser, label, width, height):
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)
    result = {"label": label, "viewport": [width, height]}

    # --- stage beats, one page load per moment so real elapsed time is honest
    for name, ms in STAGE_BEATS:
        context = await browser.new_context(viewport={"width": width, "height": height})
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        await load(page)
        # Scroll the stage itself into view: this is the moment the encounter
        # arms, so the wait below is measured from the real start of the beat.
        await arm(page, ".wnd-stage", 0)
        await page.wait_for_timeout(ms)
        await page.screenshot(path=os.path.join(folder, f"scene-{name}.png"))
        state = await page.evaluate(STATE_JS)
        await context.close()
        result[name] = {"state": state, "errors": errors}

    # --- deck, controls, record
    context = await browser.new_context(
        viewport={"width": width, "height": height}, has_touch=width < 700
    )
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await load(page)
    await arm(page)
    await page.wait_for_timeout(4600)

    await scroll_to(page, "#wnd-gallery", 40)
    loaded = await settle_images(page)
    await page.wait_for_timeout(600)
    await page.screenshot(path=os.path.join(folder, "scene-06-gallery.png"))
    result["gallery"] = {"state": await page.evaluate(STATE_JS), "imagesLoaded": loaded}

    # autoplay intervals with the pointer away from the deck
    await page.mouse.move(5, 5)
    samples, intervals = await interval_samples(page, 6.5)
    result["autoplay"] = {"changesMs": samples, "intervalsMs": intervals}
    await page.screenshot(path=os.path.join(folder, "scene-07-autoplay.png"))

    # hover pause
    await page.hover(".wnd-deck")
    before = await count(page)
    await page.wait_for_timeout(3200)
    after = await count(page)
    result["hoverPause"] = {"before": before, "after": after, "held": before == after,
                            "status": await page.evaluate("() => document.querySelector('.wnd-autoplay-status').textContent.trim()")}
    await page.mouse.move(5, 5)

    # manual next / previous
    await page.click('[aria-label="Next ResQ screenshot"]')
    await page.wait_for_timeout(500)
    next_count = await count(page)
    await page.screenshot(path=os.path.join(folder, "scene-08-manual.png"))
    await page.click('[aria-label="Previous ResQ screenshot"]')
    await page.wait_for_timeout(500)
    prev_count = await count(page)
    result["manual"] = {"afterNext": next_count, "afterPrev": prev_count}

    # dots
    await page.click(".wnd-dot:nth-child(5)")
    await page.wait_for_timeout(500)
    result["dots"] = {"afterDot5": await count(page)}

    # keyboard
    await page.focus(".wnd-carousel")
    await page.keyboard.press("ArrowRight")
    await page.wait_for_timeout(400)
    result["keyboard"] = {"afterArrowRight": await count(page)}

    # touch swipe (real input events, not synthetic Touch objects)
    if width < 700:
        box = await page.locator(".wnd-deck").bounding_box()
        if box:
            cy = box["y"] + min(box["height"] * 0.55, 320)
            x0 = box["x"] + box["width"] * 0.72
            x1 = box["x"] + box["width"] * 0.28
            client = await context.new_cdp_session(page)
            await client.send(
                "Input.dispatchTouchEvent",
                {"type": "touchStart", "touchPoints": [{"x": x0, "y": cy}]},
            )
            for step in range(1, 6):
                x = x0 + (x1 - x0) * step / 5
                await client.send(
                    "Input.dispatchTouchEvent",
                    {"type": "touchMove", "touchPoints": [{"x": x, "y": cy}]},
                )
                await page.wait_for_timeout(30)
            await client.send(
                "Input.dispatchTouchEvent",
                {"type": "touchEnd", "touchPoints": []},
            )
            await page.wait_for_timeout(600)
            result["swipe"] = {"afterSwipe": await count(page)}

    # record
    await scroll_to(page, "#wnd-record", 40)
    await settle_images(page)
    await page.wait_for_timeout(900)
    await page.screenshot(path=os.path.join(folder, "scene-09-record.png"))
    for anchor, name in [
        ("#wnd-protection", "scene-10-protection.png"),
        ("#wnd-detection", "scene-11-detection.png"),
        ("#wnd-emergency", "scene-12-emergency.png"),
        ("#wnd-location", "scene-13-location.png"),
        ("#wnd-hospitals", "scene-14-hospitals.png"),
        ("#wnd-technical", "scene-15-technical.png"),
    ]:
        await scroll_to(page, anchor, 80)
        await page.wait_for_timeout(450)
        await page.screenshot(path=os.path.join(folder, name))

    # links
    await scroll_to(page, "#wnd-record", 0)
    result["recordState"] = await page.evaluate(STATE_JS)

    # background continuity: bottom of the stage and the top of the next project
    continuity = await page.evaluate(
        """() => {
            const gallery = document.querySelector('#wnd-gallery');
            const record = document.querySelector('#wnd-record');
            const next = document.querySelector('[data-encounter="enn-consultancy"]');
            const bg = (el) => el ? getComputedStyle(el).backgroundColor : null;
            return {
                stageBg: bg(document.querySelector('.wnd-stage')),
                galleryBg: bg(gallery),
                recordBg: bg(record),
                nextEncounter: next ? next.dataset.encounter : null,
            };
        }"""
    )
    result["continuity"] = continuity
    result["errors"] = errors

    # --- reduced motion
    context = await browser.new_context(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    page = await context.new_page()
    await load(page)
    await arm(page)
    await page.wait_for_timeout(1200)
    await scroll_to(page, "#wnd-gallery", 40)
    await settle_images(page)
    await page.wait_for_timeout(600)
    await page.screenshot(path=os.path.join(folder, "reduced-01-gallery.png"))
    reduced_before = await count(page)
    await page.wait_for_timeout(3200)
    reduced_after = await count(page)
    await page.click('[aria-label="Next ResQ screenshot"]')
    await page.wait_for_timeout(300)
    result["reducedMotion"] = {
        "state": await page.evaluate(STATE_JS),
        "autoplayHeld": reduced_before == reduced_after,
        "manualWorks": (await count(page)) != reduced_after,
        "runningAnimations": await page.evaluate("() => document.getAnimations().length"),
    }
    await context.close()

    return result


async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, width, height in VIEWPORTS:
            results.append(await capture_viewport(browser, label, width, height))
            print("captured", label)
        await browser.close()

    path = os.path.join(OUT, "validation.json")
    existing = []
    if ONLY and os.path.exists(path):
        existing = json.load(open(path, encoding="utf-8"))
        existing = [r for r in existing if r.get("label") != ONLY]
    json.dump(existing + results, open(path, "w", encoding="utf-8"), indent=2)
    print("wrote", path)


asyncio.run(main())
