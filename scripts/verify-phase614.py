"""Phase 6.14 — production validation.

Against a running production build (`next start`):

  1. console errors / hydration warnings / horizontal overflow per viewport
  2. the ResQ gallery composition: copy left, deck right on desktop; stacked
     on mobile; active slide large enough to inspect; screenshots uncropped
  3. the deck keeps advancing across an encounter re-entry (it must not restart
     when the decorative technique replays)
  4. all four encounters still arm, stay armed while visible and re-arm when
     re-entered from below, each keeping its own elemental class prefix
  5. reduced motion: settled composition, no running technique animations
  6. mobile Home construction reaches its camera settle without the loader
     fallback, and Field Archive entries reveal with links and aspect ratios

Scrolling goes through real wheel events because Lenis owns the scroll; a bare
`window.scrollTo` is undone by Lenis's next frame.

Usage: python scripts/verify-phase614.py [base_url]
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
OUT = "screenshots/phase614"
os.makedirs(OUT, exist_ok=True)

VIEWPORTS = [
    (1920, 1080),
    (1366, 768),
    (1024, 768),
    (430, 932),
    (390, 844),
    (375, 812),
]

DESKTOP = {(1920, 1080), (1366, 768), (1024, 768)}

ENCOUNTERS = {
    "bugwiser": ".bw-",
    "resq": ".wnd-",
    "enn-consultancy": ".wtr-",
    "saravaraj-ai": ".fyr-",
}

results = {"gallery": {}, "carousel": {}, "encounters": {}, "reduced": {},
           "home_mobile": {}, "archive": {}, "errors": {}}


async def shot(page, path):
    """Screenshot a page that never goes fully idle (canvas + motes)."""
    try:
        await page.screenshot(path=path, animations="disabled", timeout=60000)
    except Exception as exc:  # noqa: BLE001 - a capture must not fail the audit
        print(f"  screenshot failed for {path}: {exc}")


async def dismiss_intro(page):
    skip = page.get_by_role("button", name="Skip intro")
    for _ in range(40):
        if not await skip.count():
            return
        try:
            await skip.first.click(timeout=800)
            await page.wait_for_timeout(300)
            return
        except Exception:
            await page.wait_for_timeout(150)


async def wait_idle(page, timeout_ms=9000):
    for _ in range(timeout_ms // 120):
        state = await page.evaluate(
            "() => document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null"
        )
        if state in (None, "IDLE"):
            return True
        await page.wait_for_timeout(120)
    return False


async def wheel_to(page, target_js, tolerance=60, max_steps=200):
    for _ in range(max_steps):
        delta = await page.evaluate(target_js)
        if delta is None:
            return False
        if abs(delta) <= tolerance:
            break
        await page.mouse.wheel(0, max(-900, min(900, delta)))
        await page.wait_for_timeout(70)
    await page.wait_for_timeout(800)
    await wait_idle(page)
    await page.wait_for_timeout(200)
    return True


def gallery_top_js(ratio=0.12):
    return f"""() => {{
        const el = document.querySelector('.wnd-gallery');
        if (!el) return null;
        return el.getBoundingClientRect().top - window.innerHeight * {ratio};
    }}"""


def stage_js(encounter_id, edge="top", ratio=0.2):
    return f"""() => {{
        const el = document.querySelector('[data-encounter="{encounter_id}"]');
        const stage = el ? el.querySelector('section') : null;
        if (!stage) return null;
        const rect = stage.getBoundingClientRect();
        const anchor = {'rect.top' if edge == 'top' else 'rect.bottom'};
        return anchor - window.innerHeight * {ratio};
    }}"""


CAROUSEL_STATE = """() => {
    const root = document.querySelector('.wnd-carousel');
    if (!root) return null;
    const count = root.querySelector('.wnd-carousel-count');
    const active = root.querySelector('.wnd-slide.is-active');
    const frame = active ? active.querySelector('.wnd-slide-frame') : null;
    const img = active ? active.querySelector('.wnd-shot') : null;
    const frameRect = frame ? frame.getBoundingClientRect() : null;
    const imgRect = img ? img.getBoundingClientRect() : null;
    const copy = document.querySelector('.wnd-gallery-copy');
    const copyRect = copy ? copy.getBoundingClientRect() : null;
    const deck = root.querySelector('.wnd-deck');
    const deckRect = deck ? deck.getBoundingClientRect() : null;
    return {
      live: root.dataset.live,
      countText: count ? count.textContent.trim() : null,
      activeLabel: active ? active.getAttribute('aria-label') : null,
      frameW: frameRect ? Math.round(frameRect.width) : null,
      frameH: frameRect ? Math.round(frameRect.height) : null,
      frameRatio: frameRect ? Math.round((frameRect.width / frameRect.height) * 1000) / 1000 : null,
      imgRatio: img && img.naturalWidth ? Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000 : null,
      copyLeft: copyRect ? Math.round(copyRect.left) : null,
      copyRight: copyRect ? Math.round(copyRect.right) : null,
      copyTop: copyRect ? Math.round(copyRect.top) : null,
      copyBottom: copyRect ? Math.round(copyRect.bottom) : null,
      deckLeft: deckRect ? Math.round(deckRect.left) : null,
      deckRight: deckRect ? Math.round(deckRect.right) : null,
      deckTop: deckRect ? Math.round(deckRect.top) : null,
      willChange: active ? getComputedStyle(active).willChange : null,
      slideCount: root.querySelectorAll('.wnd-slide').length,
    };
}"""

OVERFLOW = """() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
})"""


class Console:
    def __init__(self):
        self.messages = []

    def attach(self, page):
        page.on("console", self.on_console)
        page.on("pageerror", lambda exc: self.messages.append({"type": "pageerror", "text": str(exc)}))

    def on_console(self, message):
        if message.type in ("error", "warning"):
            text = message.text
            if "hydration" in text.lower() or message.type == "error":
                self.messages.append({"type": message.type, "text": text[:300]})


async def check_gallery(page, w, h):
    await dismiss_intro(page)
    await wheel_to(page, gallery_top_js())
    await page.wait_for_timeout(1200)
    await wheel_to(page, gallery_top_js(0.02), tolerance=40)
    await page.wait_for_timeout(1500)

    state = await page.evaluate(CAROUSEL_STATE)
    overflow = await page.evaluate(OVERFLOW)
    label = f"{w}x{h}"
    await shot(page, f"{OUT}/gallery-{label}.png")

    if state:
        desktop = (w, h) in DESKTOP
        state["layout_ok"] = (
            state["copyRight"] <= state["deckLeft"] + 8
            if desktop
            else state["copyBottom"] <= state["deckTop"] + 8
        )
        state["desktop"] = desktop
        state["frame_ratio_ok"] = (
            None if state["frameRatio"] is None
            else abs(state["frameRatio"] - 0.462) < 0.02
        )
    state = state or {}
    state["overflow"] = overflow["overflow"]
    results["gallery"][label] = state
    print(f"  gallery @ {label}: {json.dumps(state)}")
    return state


async def check_carousel_continuity(page):
    """The deck must keep advancing while the technique replays around it."""
    await wheel_to(page, gallery_top_js(0.1))
    await page.wait_for_timeout(900)

    async def index_now():
        text = await page.evaluate(
            "() => document.querySelector('.wnd-carousel-count')?.textContent?.trim() ?? null"
        )
        return text.split("/")[0].strip() if text else None

    samples = []
    for _ in range(3):
        await page.wait_for_timeout(2150)
        samples.append(await index_now())

    # Force the encounter to reset and replay: leave the stage, come back.
    await wheel_to(page, stage_js("resq", "bottom", 1.25))
    await page.wait_for_timeout(900)
    await wheel_to(page, gallery_top_js(0.1))
    await page.wait_for_timeout(400)

    for _ in range(3):
        await page.wait_for_timeout(2150)
        samples.append(await index_now())

    await page.wait_for_timeout(2150)
    samples.append(await index_now())

    results["carousel"]["resq"] = {"samples": samples}
    print(f"  carousel continuity: {samples}")
    return samples


async def encounter_state(page):
    return await page.evaluate(
        """(ids) => Object.fromEntries(ids.map((id) => {
            const el = document.querySelector(`[data-encounter="${id}"]`);
            if (!el) return [id, { present: false }];
            const stage = el.querySelector('section');
            const anims = stage ? [...stage.getAnimations({ subtree: true })] : [];
            const title = el.querySelector('h3');
            return [id, {
              present: true,
              active: el.getAttribute('data-active'),
              running: anims.filter((a) => a.playState === 'running').length,
              animationCount: anims.length,
              titleVisible: title ? title.getBoundingClientRect().height > 0 : false,
              textChars: el.textContent.length,
            }];
          }))""",
        list(ENCOUNTERS),
    )


async def check_encounters(page):
    out = {}
    for encounter_id, prefix in ENCOUNTERS.items():
        await wheel_to(page, stage_js(encounter_id, "top", 0.2))
        await page.wait_for_timeout(700)
        first = (await encounter_state(page))[encounter_id]
        identity = await page.evaluate(
            """([id, prefix]) => {
                const el = document.querySelector(`[data-encounter="${id}"]`);
                if (!el) return { count: 0, sample: [] };
                const nodes = [...el.querySelectorAll('[class]')].filter(
                  (n) => [...n.classList].some((c) => c.startsWith(prefix.slice(1)))
                );
                return { count: nodes.length, sample: nodes.slice(0, 3).map((n) => n.className.toString().slice(0, 60)) };
            }""",
            [encounter_id, prefix],
        )

        await page.mouse.wheel(0, 1700)
        await page.wait_for_timeout(1100)
        await wait_idle(page)
        away = (await encounter_state(page))[encounter_id]

        await wheel_to(page, stage_js(encounter_id, "bottom", 1.15))
        await wheel_to(page, stage_js(encounter_id, "top", 0.2), tolerance=40)
        await page.wait_for_timeout(600)
        again = (await encounter_state(page))[encounter_id]

        out[encounter_id] = {
            "first_entry": first,
            "away": away,
            "reentry": again,
            "identity_nodes": identity["count"],
            "identity_sample": identity["sample"],
        }
        print(f"  {encounter_id}: {json.dumps(out[encounter_id])}")
    results["encounters"] = out


async def check_reduced_motion(browser):
    context = await browser.new_context(
        viewport={"width": 1366, "height": 768}, reduced_motion="reduce"
    )
    page = await context.new_page()
    console = Console()
    console.attach(page)
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(1200)
    await dismiss_intro(page)
    state = await encounter_state(page)
    settled = {}
    for encounter_id in ENCOUNTERS:
        await wheel_to(page, stage_js(encounter_id, "top", 0.2))
        await page.wait_for_timeout(900)
        settled[encounter_id] = (await encounter_state(page))[encounter_id]
    await wheel_to(page, gallery_top_js(0.1))
    await page.wait_for_timeout(1200)
    carousel = await page.evaluate(CAROUSEL_STATE)
    await shot(page, f"{OUT}/reduced-motion-1366x768.png")
    overflow = await page.evaluate(OVERFLOW)
    results["reduced"] = {
        "initial": state,
        "settled": settled,
        "carousel": carousel,
        "overflow": overflow["overflow"],
        "messages": console.messages,
    }
    print(f"  reduced motion: {json.dumps(results['reduced'])}")
    await context.close()


async def check_home_mobile(browser):
    context = await browser.new_context(viewport={"width": 390, "height": 844})
    page = await context.new_page()
    console = Console()
    console.attach(page)
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    samples = []
    for _ in range(11):
        await page.wait_for_timeout(700)
        samples.append(
            await page.evaluate(
                """() => {
                    const world = document.querySelector('.leaf-world');
                    const loader = [...document.querySelectorAll('div')].some(
                      (el) => el.className.includes('z-[100]') && !el.className.includes('opacity-0')
                    );
                    if (!world) return { present: false, loader };
                    return {
                      present: true,
                      loader,
                      stages: ['ready', 'mountains', 'terrain', 'buildings', 'lit', 'camera']
                        .map((k) => world.dataset[k]).join(','),
                      litWindows: world.querySelectorAll('.lw-window').length,
                      lamps: world.querySelectorAll('.lw-lamp').length,
                      motes: world.querySelectorAll('.lw-mote').length,
                    };
                }"""
            )
        )
    hero = await page.evaluate(
        """() => {
            const h1 = document.querySelector('#home h1');
            if (!h1) return null;
            const wrap = h1.closest('div[class*="transition-all"]');
            return wrap ? Number(getComputedStyle(wrap).opacity) : null;
        }"""
    )
    await shot(page, f"{OUT}/home-mobile-390x844.png")
    results["home_mobile"] = {"samples": samples, "heroOpacity": hero, "messages": console.messages}
    print(f"  mobile home: {json.dumps(results['home_mobile'])}")
    await context.close()


async def check_archive(page, w, h):
    await dismiss_intro(page)
    await wheel_to(
        page,
        """() => {
            const el = document.querySelector('.fa');
            if (!el) return null;
            return el.getBoundingClientRect().top - 90;
        }""",
    )
    await page.wait_for_timeout(1600)
    down = await page.evaluate(
        """() => {
            const cards = [...document.querySelectorAll('.fa-card')];
            return {
              count: cards.length,
              visible: cards.filter((c) => c.dataset.visible === 'true').length,
              links: cards.map((c) => c.getAttribute('href')),
              aspect: cards.map((c) => {
                const m = c.querySelector('.fa-media');
                if (!m) return null;
                const [aw, ah] = getComputedStyle(m).aspectRatio.split('/');
                return Math.round((Number(aw) / Number(ah)) * 100) / 100;
              }),
              titlesUnmasked: cards.map((c) => {
                const t = c.querySelector('.fa-title-text');
                return t ? Math.round(new DOMMatrixReadOnly(getComputedStyle(t).transform).m42) : null;
              }),
            };
        }"""
    )
    await shot(page, f"{OUT}/archive-{w}x{h}.png")

    # Reverse scroll back into the block from below.
    await wheel_to(page, """() => {
        const el = document.querySelector('.fa');
        if (!el) return null;
        return el.getBoundingClientRect().bottom - window.innerHeight * 0.1;
    }""")
    await wheel_to(
        page,
        """() => {
            const el = document.querySelector('.fa');
            if (!el) return null;
            return el.getBoundingClientRect().top - 120;
        }""",
        tolerance=40,
    )
    await page.wait_for_timeout(1200)
    up = await page.evaluate(
        """() => {
            const cards = [...document.querySelectorAll('.fa-card')];
            return {
              visible: cards.filter((c) => c.dataset.visible === 'true').length,
              titlesUnmasked: cards.map((c) => {
                const t = c.querySelector('.fa-title-text');
                return t ? Math.round(new DOMMatrixReadOnly(getComputedStyle(t).transform).m42) : null;
              }),
            };
        }"""
    )
    results["archive"] = {"down": down, "up": up}
    print(f"  archive: {json.dumps(results['archive'])}")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for w, h in VIEWPORTS:
            label = f"{w}x{h}"
            context = await browser.new_context(viewport={"width": w, "height": h})
            page = await context.new_page()
            console = Console()
            console.attach(page)
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1100)
            await check_gallery(page, w, h)
            top = await page.evaluate(OVERFLOW)
            results["errors"][label] = {
                "messages": console.messages,
                "overflow_top": top["overflow"],
            }
            if (w, h) == (1366, 768):
                await check_carousel_continuity(page)
                await check_encounters(page)
                await check_archive(page, w, h)
            await context.close()

        await check_home_mobile(browser)
        await check_reduced_motion(browser)
        await browser.close()

    with open(f"{OUT}/production-validation.json", "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=1)
    print(f"\nwrote {OUT}/production-validation.json")


asyncio.run(main())
