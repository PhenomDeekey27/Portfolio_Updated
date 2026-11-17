"""PHASE 6.10 — ENN Water Release / Saravaraj Fire Release evidence capture.

For each viewport: loads the page, arms the ENN encounter and captures the
elemental beats plus the flow diagram and record, then does the same for
Saravaraj. Also runs a reduced-motion pass and writes a summary to
screenshots/phase610/validation.json.

Usage:
    BASE=http://localhost:3000 python scripts/capture-phase610.py [1920|1366|390|375|430]
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3000")
OUT = os.path.join("screenshots", "phase610")

ALL_VIEWPORTS = [
    ("1920", 1920, 1080),
    ("1366", 1366, 768),
    ("430", 430, 932),
    ("390", 390, 844),
    ("375", 375, 812),
]
ONLY = sys.argv[1] if len(sys.argv) > 1 else None
VIEWPORTS = [v for v in ALL_VIEWPORTS if not ONLY or v[0] == ONLY]

STAGE_BEATS = [
    ("01-gather", 500),
    ("02-form", 1300),
    ("03-pulse", 2100),
    ("04-title", 3200),
    ("05-settled", 5000),
]

SCENES = {
    "enn": {
        "encounter": "enn-consultancy",
        "prefix": "wtr",
        "stage": ".wtr-stage",
        "flow": ".wtr-flow",
        "record": ".wtr-record",
        "title": "#wtr-title",
    },
    "saravaraj": {
        "encounter": "saravaraj-ai",
        "prefix": "fyr",
        "stage": ".fyr-stage",
        "flow": ".fyr-net",
        "record": ".fyr-record",
        "title": "#fyr-title",
    },
}

STATE_JS = """(scene) => {
  const q = (s) => document.querySelector(s);
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const p = scene.prefix;
  const article = q(`[data-encounter="${scene.encounter}"]`);
  const titleText = q(`.${p}-title-text`);
  return {
    active: article?.dataset.active || null,
    stage: r(q(scene.stage)),
    flow: r(q(scene.flow)),
    record: r(q(scene.record)),
    title: r(q(scene.title)),
    titleFont: q(`.${p}-title`) ? getComputedStyle(q(`.${p}-title`)).fontSize : null,
    titleOpacity: titleText ? getComputedStyle(titleText).opacity : null,
    titleClip: titleText ? getComputedStyle(titleText).clipPath : null,
    introOpacity: q(`.${p}-intro`) ? getComputedStyle(q(`.${p}-intro`)).opacity : null,
    notesOpacity: q(`.${p}-notes`) ? getComputedStyle(q(`.${p}-notes`)).opacity : null,
    nodes: article ? article.querySelectorAll(`.${p}-node`).length : 0,
    channels: article ? article.querySelectorAll(`.${p}-channel`).length : 0,
    stageBg: q(scene.stage) ? getComputedStyle(q(scene.stage)).backgroundColor : null,
    flowBg: q(scene.flow) ? getComputedStyle(q(scene.flow)).backgroundColor : null,
    recordBg: q(scene.record) ? getComputedStyle(q(scene.record)).backgroundColor : null,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    animations: article ? article.getAnimations({ subtree: true }).length : 0,
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


async def arm(page, encounter, stage_selector):
    await scroll_to(page, stage_selector, 20)
    try:
        await page.wait_for_function(
            """(id) => document.querySelector(`[data-encounter="${id}"]`)?.dataset.active === 'true'""",
            arg=encounter,
            timeout=20000,
        )
    except Exception:
        pass


async def shot(page, folder, name, selector, pad=0):
    el = page.locator(selector).first
    await el.screenshot(path=os.path.join(folder, name + ".png"))
    return name


async def capture_scene(page, folder, key, scene, reduced=False):
    # Elemental beats: a fresh load before each so elapsed timing is real.
    if not reduced:
        for name, ms in STAGE_BEATS:
            await load(page)
            await arm(page, scene["encounter"], scene["stage"])
            await page.wait_for_timeout(ms)
            await page.locator(scene["stage"]).first.screenshot(
                path=os.path.join(folder, f"{key}-{name}.png")
            )
    await load(page)
    await arm(page, scene["encounter"], scene["stage"])
    await page.wait_for_timeout(4200 if not reduced else 400)
    await page.locator(scene["stage"]).first.screenshot(
        path=os.path.join(folder, f"{key}-06-settled.png")
    )

    state = await page.evaluate(STATE_JS, scene)

    await scroll_to(page, scene["flow"], 24)
    await page.wait_for_timeout(1100)
    await page.locator(scene["flow"]).first.screenshot(
        path=os.path.join(folder, f"{key}-07-flow.png")
    )

    await scroll_to(page, scene["record"], 24)
    await page.wait_for_timeout(1100)
    await page.locator(scene["record"]).first.screenshot(
        path=os.path.join(folder, f"{key}-08-record.png")
    )
    return state


async def capture_viewport(browser, label, width, height):
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)
    result = {"label": label, "viewport": [width, height], "errors": []}

    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    page.on("pageerror", lambda e: result["errors"].append(str(e)))
    page.on("console", lambda m: result["errors"].append(m.text) if m.type == "error" else None)

    result["enn"] = await capture_scene(page, folder, "enn", SCENES["enn"])
    result["saravaraj"] = await capture_scene(page, folder, "saravaraj", SCENES["saravaraj"])
    await page.screenshot(path=os.path.join(folder, "viewport.png"))
    await context.close()

    reduced = await browser.new_context(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    rpage = await reduced.new_page()
    rpage.on("pageerror", lambda e: result["errors"].append("reduced: " + str(e)))
    result["reduced"] = {
        "enn": await capture_scene(rpage, folder, "reduced-enn", SCENES["enn"], reduced=True),
        "saravaraj": await capture_scene(
            rpage, folder, "reduced-saravaraj", SCENES["saravaraj"], reduced=True
        ),
    }
    await reduced.close()
    return result


async def main():
    os.makedirs(OUT, exist_ok=True)
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for label, width, height in VIEWPORTS:
            results.append(await capture_viewport(browser, label, width, height))
            print("captured", label)
        await browser.close()

    path = os.path.join(OUT, "validation.json")
    existing = {}
    if os.path.exists(path):
        try:
            for item in json.load(open(path, encoding="utf-8")):
                existing[item["label"]] = item
        except Exception:
            existing = {}
    for item in results:
        existing[item["label"]] = item
    ordered = [existing[v[0]] for v in ALL_VIEWPORTS if v[0] in existing]
    json.dump(ordered, open(path, "w", encoding="utf-8"), indent=2)
    print("wrote", path)


if __name__ == "__main__":
    asyncio.run(main())
