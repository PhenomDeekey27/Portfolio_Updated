"""PHASE 6.18 — production verification.

Checks the surfaces this phase changed, against a production build
(`next start -p 3100`):

  1. COMPOSITION — seven viewports: horizontal overflow, section anchors,
     console errors, footer.
  2. HOME — the phone copy leads: when the name is readable, and whether the
     village is still being built at that moment.
  3. ABOUT — the phone band and the copy meet (no dead band, no giant scene),
     and the statues' plate keeps the full width.
  4. RESQ — the deck appears before the explainer copy on a phone, and the
     design-reference rail is contained by its own box.
  5. ARCHIVE — four seals, selecting one reveals that record, the live link
     follows the record, keyboard arrows work.
  6. STACKS — technology and integration groups are separate and label the
     verified entries.
  7. REDUCED MOTION — settled world, copy visible, no decorative loops.

    python scripts/verify-phase618.py [--url http://localhost:3100]

Output: screenshots/phase618/verify/<viewport>-*.png, report printed as JSON.
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

OUT = Path("screenshots/phase618/verify")
VIEWPORTS = [
    (320, 655, True),
    (375, 812, True),
    (390, 844, True),
    (430, 932, True),
    (768, 1024, True),
    (1024, 768, False),
    (1440, 900, False),
]

LAYOUT_JS = """() => {
  const root = document.documentElement;
  const vw = window.innerWidth;
  const anchors = ['home','about','skills','missions','experience','contact']
    .map((id) => ({ id, present: !!document.getElementById(id) }));
  const over = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const style = getComputedStyle(el);
      if (style.position === 'fixed') return false;
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') return false;
      return r.right > vw + 1 || r.left < -1;
    })
    .slice(0, 8)
    .map((el) => ({ tag: el.tagName, cls: String(el.className).slice(0, 60) }));
  return {
    vw,
    scrollWidth: root.scrollWidth,
    overflow: root.scrollWidth - vw,
    anchors,
    offenders: over,
    footer: !!document.querySelector('footer'),
    archive: !!document.querySelector('.fa'),
  };
}"""

HOME_JS = """() => {
  const hero = document.getElementById('home');
  const name = hero.querySelector('h1 span span');
  const role = [...hero.querySelectorAll('p')]
    .find((p) => p.textContent.toLowerCase().includes('ai-focused'));
  const intro = [...hero.querySelectorAll('p')].find((p) => p.textContent.length > 120);
  const stage = document.querySelector('[data-world-mode]');
  const world = document.querySelector('.leaf-world');
  const op = (el) => (el ? Number(getComputedStyle(el).opacity) : 0);
  return {
    nameOpacity: +op(name).toFixed(2),
    roleOpacity: +op(role).toFixed(2),
    introOpacity: +op(intro).toFixed(2),
    worldMode: stage?.dataset.worldMode ?? null,
    worldSettled: stage?.dataset.worldSettled ?? null,
    buildings: world?.dataset.buildings ?? null,
    lit: world?.dataset.lit ?? null,
  };
}"""

ABOUT_JS = """() => {
  const section = document.getElementById('about');
  const content = document.querySelector('[data-section-content="about"]');
  const band = document.querySelector('.valley-band');
  const img = document.querySelector('.valley-img');
  const heading = content?.querySelector('h2');
  if (!section || !band || !img) return null;
  const s = section.getBoundingClientRect();
  const b = band.getBoundingClientRect();
  const i = img.getBoundingClientRect();
  const h = heading?.getBoundingClientRect();
  const styles = getComputedStyle(img);
  return {
    viewport: [window.innerWidth, window.innerHeight],
    sectionTop: Math.round(s.top + window.scrollY),
    bandHeight: Math.round(b.height),
    bandWidth: Math.round(b.width),
    imageWidth: Math.round(i.width),
    imageHeight: Math.round(i.height),
    imageRatio: +(i.width / i.height).toFixed(3),
    plateRatio: +(1672 / 941).toFixed(3),
    objectFit: styles.objectFit,
    objectPosition: styles.objectPosition,
    bandPosition: getComputedStyle(band).position,
    headingGapFromBand: h ? Math.round(h.top - b.bottom) : null,
    contentTop: content ? Math.round(content.getBoundingClientRect().top) : null,
  };
}"""

RESQ_JS = """() => {
  const gallery = document.getElementById('wnd-gallery');
  const split = gallery?.querySelector('.wnd-gallery-split');
  if (!split) return null;
  const items = [...split.children].map((el) => ({
    cls: el.className,
    top: Math.round(el.getBoundingClientRect().top + window.scrollY),
  }));
  const deck = gallery.querySelector('.wnd-deck');
  const rail = document.getElementById('wnd-references')?.parentElement?.querySelector('.wnd-chapter-screens');
  const d = deck?.getBoundingClientRect();
  return {
    items,
    deckTop: d ? Math.round(d.top + window.scrollY) : null,
    deckWidth: d ? Math.round(d.width) : null,
    deckCentreOffset: d ? Math.round(d.left + d.width / 2 - window.innerWidth / 2) : null,
    railScrollable: rail ? rail.scrollWidth > rail.clientWidth + 2 : false,
    railOverflowX: rail ? getComputedStyle(rail).overflowX : null,
  };
}"""


SCROLL_JS = """(selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  return true;
}"""


async def scroll_to(page, selector):
    await page.evaluate(SCROLL_JS, selector)


async def shot(page, name):
    """Evidence screenshot of the settled state.

    `animations="disabled"` fast-forwards one-shot reveals to their end state.
    Headless Chromium only advances animations when it produces a frame, so a
    capture taken mid-timeline can otherwise show a half-finished reveal that no
    real browser would hold.
    """
    try:
        await page.screenshot(path=str(OUT / name), timeout=15000, animations="disabled")
    except Exception:
        try:
            await page.screenshot(path=str(OUT / name), timeout=20000)
        except Exception as error:  # pragma: no cover - evidence only
            print(f"[shot failed] {name}: {error}", file=sys.stderr)


async def fresh(page, url):
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_timeout(500)


async def skip_intro(page):
    skip = page.get_by_role("button", name="Skip intro")
    if await skip.count():
        try:
            await skip.first.click(timeout=1500)
        except Exception:
            pass
    await page.wait_for_timeout(900)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:3100")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    report = {"viewport": {}, "home": {}, "about": {}, "resq": {}, "archive": {}, "stacks": {}, "reduced": {}}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for width, height, mobile in VIEWPORTS:
            ctx = await browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2 if mobile else 1,
                is_mobile=mobile,
                has_touch=mobile,
            )
            page = await ctx.new_page()
            errors = []
            page.on("console", lambda m: errors.append(m.text[:200]) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)[:200]))
            await fresh(page, args.url)
            await skip_intro(page)
            layout = await page.evaluate(LAYOUT_JS)
            layout["consoleErrors"] = errors
            report["viewport"][f"{width}x{height}"] = layout
            await shot(page, f"{width}-home.png")

            # About geometry + shot
            await scroll_to(page, "#about")
            await page.wait_for_timeout(2600)
            about = await page.evaluate(ABOUT_JS)
            if width in (320, 390, 430, 1440):
                report["about"][f"{width}"] = about
                await shot(page, f"{width}-about.png")

            # ResQ gallery order + deck centring
            await scroll_to(page, "#wnd-gallery")
            await page.wait_for_timeout(1400)
            if width in (320, 390, 1440):
                report["resq"][f"{width}"] = await page.evaluate(RESQ_JS)
                await shot(page, f"{width}-resq-gallery.png")

            # BugWiser replay: forward into the stage, past it, then back up.
            if width in (390, 1440):
                await page.evaluate(
                    """() => { const el = document.querySelector('[data-encounter=\"bugwiser\"] .bw-stage');
                        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'instant' }); }"""
                )
                await page.wait_for_timeout(1000)
                armed_forward = await page.get_attribute("[data-encounter='bugwiser']", "data-active")
                await page.evaluate(
                    """() => { const el = document.querySelector('[data-encounter=\"bugwiser\"] .bw-stage');
                        window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY + 400, behavior: 'instant' }); }"""
                )
                await page.wait_for_timeout(1000)
                armed_away = await page.get_attribute("[data-encounter='bugwiser']", "data-active")
                await page.evaluate(
                    """() => { const el = document.querySelector('[data-encounter=\"bugwiser\"] .bw-stage');
                        window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.5, behavior: 'instant' }); }"""
                )
                await page.wait_for_timeout(1200)
                armed_back = await page.get_attribute("[data-encounter='bugwiser']", "data-active")
                report.setdefault("replay", {})[f"{width}"] = {
                    "forward": armed_forward,
                    "away": armed_away,
                    "backUp": armed_back,
                }
                await shot(page, f"{width}-bugwiser-replay.png")

            # Archive interaction
            await scroll_to(page, ".fa")
            await page.wait_for_timeout(1200)
            tabs = page.locator(".fa-seal")
            tab_count = await tabs.count()
            first_link = await page.locator(".fa-enter").get_attribute("href")
            await tabs.nth(1).click()
            await page.wait_for_timeout(900)
            second = {
                "title": await page.locator(".fa-record-title").inner_text(),
                "link": await page.locator(".fa-enter").get_attribute("href"),
                "kicker": await page.locator(".fa-record-kicker").inner_text(),
            }
            await tabs.nth(1).focus()
            await page.keyboard.press("ArrowRight")
            await page.wait_for_timeout(700)
            third_title = await page.locator(".fa-record-title").inner_text()
            if width in (320, 390, 1440):
                report["archive"][f"{width}"] = {
                    "tabCount": tab_count,
                    "firstLink": first_link,
                    "second": second,
                    "arrowRightTitle": third_title,
                }
                await shot(page, f"{width}-archive.png")

            # Stack vs integrations in the ENN record
            if width in (390, 1440):
                stacks = await page.evaluate(
                    """() => {
                        const res = {};
                        const grab = (root, label) => {
                            const panels = [...root.querySelectorAll('.wtr-panel, .fyr-panel')];
                            return panels.map((panel) => ({
                                label: panel.querySelector('.wtr-panel-label, .fyr-panel-label')?.textContent?.trim(),
                                items: [...panel.querySelectorAll('.wtr-stack li, .fyr-stack li')].map((li) => li.textContent.trim()),
                            })).filter((p) => p.items.length);
                        };
                        const water = document.querySelector('[data-jutsu="water"]');
                        const fire = document.querySelector('[data-jutsu="fire"]');
                        res.water = water ? grab(water) : null;
                        res.fire = fire ? grab(fire) : null;
                        return res;
                    }"""
                )
                report["stacks"][f"{width}"] = stacks

            # Home timeline (phone only): sample the hero copy and the world.
            if width == 390:
                await fresh(page, args.url)
                samples = []
                for _ in range(12):
                    await page.wait_for_timeout(250)
                    samples.append(await page.evaluate(HOME_JS))
                report["home"]["390"] = samples

            await ctx.close()

        # Reduced motion
        for width, height in ((390, 844), (1440, 900)):
            ctx = await browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion="reduce",
                is_mobile=width < 1024,
                has_touch=width < 1024,
            )
            page = await ctx.new_page()
            await fresh(page, args.url)
            await page.wait_for_timeout(1600)
            state = await page.evaluate(
                """() => {
                    const hero = document.getElementById('home');
                    const name = hero.querySelector('h1 span span');
                    const stage = document.querySelector('[data-world-mode]');
                    const loops = document.getAnimations()
                      .filter((a) => a.effect?.getTiming?.().iterations === Infinity)
                      .map((a) => a.animationName || 'transition');
                    return {
                        nameOpacity: Number(getComputedStyle(name).opacity),
                        worldMode: stage?.dataset.worldMode ?? null,
                        infiniteAnimations: [...new Set(loops)],
                        skipButton: !!document.querySelector('.skip-intro'),
                    };
                }"""
            )
            report["reduced"][f"{width}"] = state
            await shot(page, f"{width}-reduced.png")
            await ctx.close()

        await browser.close()

    print(json.dumps(report, indent=2))


asyncio.run(main())
