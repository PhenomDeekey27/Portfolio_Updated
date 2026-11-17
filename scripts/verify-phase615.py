"""
PHASE 6.15 — regression matrix for the mission encounters.

Checks, per viewport:
  * no horizontal overflow
  * the rank seal does not overlap the kicker
  * each carousel's active slide is centred in the viewport
  * every encounter re-arms on the way down AND on the way back up
  * the carousel advances with its next control
  * reduced motion still shows the copy (never a blank stage)

Run against a fresh `next start` on port 3100:

    python scripts/verify-phase615.py
"""

import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright

URL = "http://localhost:3100"
VIEWPORTS = [
    (320, 655),
    (360, 800),
    (375, 812),
    (390, 844),
    (430, 932),
    (768, 1024),
    (1024, 768),
    (1366, 768),
]
JUTSU = ["sand", "wind", "water", "fire"]

# The app scrolls through Lenis, which animates `scrollTo({immediate: true})`
# anyway and was still in flight when a sample was taken. This is the same
# instant-move recipe lib/scroll.ts uses for its own hidden jumps.
SCROLL = """(y) => {
  const html = document.documentElement, body = document.body;
  const prev = [html.style.overflow, body.style.overflow];
  html.style.overflow = ''; body.style.overflow = '';
  window.scrollTo({ top: y, behavior: 'instant' });
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
  html.style.overflow = prev[0]; body.style.overflow = prev[1];
}"""

GEOMETRY = """() => {
  const res = { overflow: document.documentElement.scrollWidth - innerWidth, vw: innerWidth, stages: [], decks: [] };
  for (const jutsu of ["sand","wind","water","fire"]) {
    const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
    if (!art) continue;
    const prefix = {sand:"bw", wind:"wnd", water:"wtr", fire:"fyr"}[jutsu];
    const stage = art.querySelector(`.${prefix}-stage`);
    const kicker = stage.querySelector(`.${prefix}-kicker`);
    const rank = stage.querySelector(`.${prefix}-rank`);
    const sr = stage.getBoundingClientRect(), kr = kicker.getBoundingClientRect(), rr = rank.getBoundingClientRect();
    const copy = stage.querySelector(`.${prefix}-copy`) || stage.querySelector(`.${prefix}-stage-copy`);
    const cr = copy.getBoundingClientRect();
    res.stages.push({
      jutsu,
      stageW: Math.round(sr.width),
      stageX: +sr.x.toFixed(1),
      kickerX: +kr.x.toFixed(1),
      copyX: +cr.x.toFixed(1),
      copyW: Math.round(cr.width),
      badgeOverlap: kr.left < rr.right && rr.left < kr.right && kr.top < rr.bottom && rr.top < kr.bottom,
      copyInside: cr.left >= -1 && cr.right <= innerWidth + 1,
    });
    const deck = art.querySelector(`.${prefix}-carousel`) || art.querySelector(`.${prefix}-deck`);
    if (deck) {
      const act = deck.querySelector(".is-active");
      if (act) {
        const r = act.getBoundingClientRect();
        res.decks.push({
          jutsu,
          activeX: +r.x.toFixed(1),
          activeW: +r.width.toFixed(1),
          // Centre of the *content* box: on desktop the scrollbar strip is not part
          // of the composition, so innerWidth would report a false 5px offset.
          centreDelta: +((r.x + r.width / 2) - document.body.getBoundingClientRect().width / 2).toFixed(1),
          insideViewport: r.left >= -1 && r.right <= innerWidth + 1,
          // The ResQ deck shares a two-column gallery on desktop by design; only
          // a deck that owns the row has to be centred in it.
          ownsRow: (() => {
            const holder = deck.closest('[class*="gallery"], [class*="deck-wrap"]') || deck;
            return holder.getBoundingClientRect().width > innerWidth * 0.6;
          })(),
        });
      }
    }
  }
  return res;
}"""

ARM = """(jutsu) => {
  const a = document.querySelector(`[data-jutsu="${jutsu}"]`);
  return a ? a.getAttribute('data-active') : null;
}"""


async def scroll_to_jutsu(page, jutsu, offset=0):
    y = await page.evaluate(
        """([j, off]) => {
          const el = document.querySelector(`[data-jutsu="${j}"] .wnd-stage, [data-jutsu="${j}"] .bw-stage, [data-jutsu="${j}"] .wtr-stage, [data-jutsu="${j}"] .fyr-stage`);
          return el.getBoundingClientRect().top + window.scrollY + off;
        }""",
        [jutsu, offset],
    )
    await page.evaluate(SCROLL, y)
    await page.wait_for_timeout(1000)


async def main():
    report = {"viewports": [], "replay": [], "carousel": [], "reduced_motion": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for w, h in VIEWPORTS:
            page = await browser.new_page(viewport={"width": w, "height": h})
            await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1400)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=1500)
                except Exception:
                    pass
            for y in range(0, 38000, 600):
                await page.evaluate(SCROLL, y)
                await page.wait_for_timeout(20)
            await page.wait_for_timeout(700)
            geo = await page.evaluate(GEOMETRY)
            geo["viewport"] = f"{w}x{h}"
            report["viewports"].append(geo)
            bad = [s["jutsu"] for s in geo["stages"] if s["badgeOverlap"] or not s["copyInside"]]
            off = [d["jutsu"] for d in geo["decks"] if d.get("ownsRow", True) and abs(d["centreDelta"]) > 2]
            print(
                f"{w}x{h}: overflow {geo['overflow']}px  badge/copy issues {bad or 'none'}"
                f"  decks off-centre {off or 'none'}"
            )
            await page.close()

        # ---- replay in both directions (desktop) ----
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1400)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        await page.wait_for_timeout(600)

        for jutsu in JUTSU:
            # Forward: arrive from above.
            await scroll_to_jutsu(page, jutsu)
            await page.wait_for_timeout(2600)
            forward = await page.evaluate(ARM, jutsu)
            # Leave far below, then come back up.
            await page.evaluate(SCROLL, 38000)
            await page.wait_for_timeout(1500)
            away = await page.evaluate(ARM, jutsu)
            await scroll_to_jutsu(page, jutsu)
            await page.wait_for_timeout(2600)
            back = await page.evaluate(ARM, jutsu)
            report["replay"].append(
                {"jutsu": jutsu, "onEntry": forward, "afterLeaving": away, "onReturn": back}
            )
            print(f"replay {jutsu}: entry {forward} / away {away} / return {back}")

        # ---- carousel advances ----
        await scroll_to_jutsu(page, "wind", 900)
        await page.wait_for_timeout(1200)
        before = await page.evaluate(
            "() => document.querySelector('.wnd-carousel-count')?.textContent?.trim()"
        )
        nxt = page.get_by_role("button", name="Next ResQ screenshot")
        if await nxt.count():
            await nxt.first.click()
        await page.wait_for_timeout(900)
        after = await page.evaluate(
            "() => document.querySelector('.wnd-carousel-count')?.textContent?.trim()"
        )
        report["carousel"].append({"before": before, "after": after, "advanced": before != after})
        print(f"carousel: {before} -> {after}")

        # ---- Home and the archive are still reachable ----
        journeys = []
        for label, target in [("Home", "home"), ("Missions", "missions"), ("Contact", "contact")]:
            nav = page.get_by_role("link", name=label, exact=True).first
            if not await nav.count():
                journeys.append({"label": label, "ok": None})
                continue
            await nav.click()
            await page.wait_for_timeout(3200)
            top = await page.evaluate(
                "(id) => { const el = document.getElementById(id); return el ? Math.round(el.getBoundingClientRect().top) : null; }",
                target,
            )
            journeys.append({"label": label, "ok": top is not None and abs(top) < 260, "top": top})
            print(f"journey {label}: #{target} top {top}")
        archive = page.locator("#fa-title")
        await page.evaluate(SCROLL, 30000)
        await page.wait_for_timeout(800)
        archive_visible = await archive.count() and await archive.first.is_visible()
        report["journeys"] = journeys
        report["archive"] = {"present": bool(archive_visible)}
        print(f"archive heading present: {bool(archive_visible)}")

        await page.close()

        # ---- reduced motion ----
        ctx = await browser.new_context(
            viewport={"width": 390, "height": 844}, reduced_motion="reduce"
        )
        page = await ctx.new_page()
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=1500)
            except Exception:
                pass
        for jutsu in JUTSU:
            await scroll_to_jutsu(page, jutsu)
            await page.wait_for_timeout(900)
            vis = await page.evaluate(
                """(j) => {
                  const art = document.querySelector(`[data-jutsu="${j}"]`);
                  const intro = art.querySelector('[class*="-intro"]');
                  const title = art.querySelector('h3, h2');
                  const o = (el) => (el ? +getComputedStyle(el).opacity : null);
                  return {intro: o(intro), title: o(title), active: art.getAttribute('data-active')};
                }""",
                jutsu,
            )
            report["reduced_motion"].append({"jutsu": jutsu, **vis})
            print(f"reduced motion {jutsu}: {vis}")
        await ctx.close()
        await browser.close()

    out = Path("screenshots/phase615/regression.json")
    out.write_text(json.dumps(report, indent=1))
    print(f"\nwrote {out}")


if __name__ == "__main__":
    asyncio.run(main())
