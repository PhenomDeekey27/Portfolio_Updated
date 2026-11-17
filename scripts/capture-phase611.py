"""PHASE 6.11 — Missions background / Grand Wind Release / elemental seam evidence.

For every required viewport this harness:
  * reads the asset actually painted by the Skills and Missions world layers
    (`data-world-asset`) and the computed background-image of the Missions plate;
  * captures the Missions header, the Skills environment, the Skills→Missions
    boundary and the three elemental seams (forward and reverse);
  * arms the ResQ encounter and captures the wind beats;
  * runs a reduced-motion pass;
  * records horizontal overflow, section continuity and console/page errors.

Usage:
    BASE=http://localhost:3000 python scripts/capture-phase611.py [viewport]

    viewport ∈ {1920, 1366, 430, 390, 375} (default: all)
"""

import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3000")
OUT = os.path.join("screenshots", "phase611")

VIEWPORTS = [
    ("1920", 1920, 1080),
    ("1366", 1366, 768),
    ("430", 430, 932),
    ("390", 390, 844),
    ("375", 375, 812),
]
ONLY = sys.argv[1] if len(sys.argv) > 1 else None

SKIP_INTRO = """() => {
  const b = [...document.querySelectorAll('button')]
    .find((btn) => /skip intro/i.test(btn.textContent || ''));
  if (b) b.click();
}"""


async def settle(page, ms=600):
    await page.wait_for_timeout(ms)


async def armed(page, encounter, timeout=20000):
    waited = 0
    while waited < timeout:
        active = await page.evaluate(
            "(id) => document.querySelector(`[data-encounter=\"${id}\"]`)?.dataset.active",
            encounter,
        )
        if active == "true":
            return True
        await page.wait_for_timeout(250)
        waited += 250
    return False


async def scroll_to(page, y):
    await page.evaluate("(top) => window.scrollTo({ top, behavior: 'instant' })", int(y))


async def capture_viewport(browser, label, width, height):
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)

    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.on("console", lambda msg: errors.append(f"console:{msg.type}:{msg.text[:160]}")
            if msg.type == "error" else None)

    await page.goto(BASE, wait_until="networkidle")
    await settle(page, 1600)
    await page.evaluate(SKIP_INTRO)
    await settle(page, 700)

    # ---------- world assets ----------
    assets = await page.evaluate(
        """() => {
          const skills = document.querySelector('[data-skills-world]');
          const missions = document.querySelector('[data-missions-world]');
          const plate = missions ? missions.querySelector('div[style]') : null;
          return {
            skills: skills?.dataset.worldAsset || null,
            missions: missions?.dataset.worldAsset || null,
            missionsPlate: plate ? getComputedStyle(plate).backgroundImage : null,
            skillsImg: skills?.querySelector('img')?.getAttribute('src') || null,
          };
        }"""
    )

    # ---------- Skills environment (through the real teleport) ----------
    await page.evaluate(
        """() => document.querySelector('nav[aria-label="Primary navigation"] a[href="#skills"]').click()"""
    )
    for _ in range(80):
        opacity = await page.evaluate(
            "() => getComputedStyle(document.querySelector('[data-skills-world]')).opacity"
        )
        if float(opacity) > 0.95:
            break
        await page.wait_for_timeout(250)
    await settle(page, 500)
    await page.screenshot(path=os.path.join(folder, "skills-environment.png"))

    # ---------- boundary geometry (absolute, no scrolling) ----------
    boundary = await page.evaluate(
        """() => {
          const abs = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) };
          };
          const skills = abs(document.querySelector('#skills'));
          const missions = abs(document.querySelector('#missions'));
          const skillsWorld = abs(document.querySelector('[data-skills-world]'));
          const missionsWorld = abs(document.querySelector('[data-missions-world]'));
          return {
            skillsBottom: skills.bottom,
            missionsTop: missions.top,
            gap: missions.top - skills.bottom,
            skillsWorldBottom: skillsWorld ? skillsWorld.bottom : null,
            missionsWorldTop: missionsWorld ? missionsWorld.top : null,
            skillsPlateCoversSection:
              !!skillsWorld && Math.abs(skillsWorld.bottom - skills.bottom) <= 1,
            missionsPlateCoversSection:
              !!missionsWorld && Math.abs(missionsWorld.top - missions.top) <= 1,
          };
        }"""
    )

    # ---------- the boundary itself is owned by the Rasengan transition, so
    # capture the live crossing instead of a static crop. ----------
    await scroll_to(
        page,
        await page.evaluate(
            "() => document.querySelector('#missions').getBoundingClientRect().top + scrollY - innerHeight * 0.35"
        ),
    )
    await settle(page, 420)
    await page.screenshot(path=os.path.join(folder, "skills-missions-crossing.png"))
    await settle(page, 2200)
    await page.screenshot(path=os.path.join(folder, "skills-missions-arrival.png"))

    # ---------- Missions header ----------
    await scroll_to(
        page,
        await page.evaluate(
            "() => document.querySelector('#missions').getBoundingClientRect().top + scrollY"
        ),
    )
    await settle(page, 900)
    await page.screenshot(path=os.path.join(folder, "missions-header.png"))

    # ---------- ResQ beats ----------
    # The one-shot timeline is scrubbed with the Web Animations API so each
    # stage is captured at its real timestamp regardless of screenshot latency.
    await scroll_to(
        page,
        await page.evaluate(
            "() => document.querySelector('[data-encounter=\"resq\"]').getBoundingClientRect().top + scrollY"
        ),
    )
    await armed(page, "resq")
    for name, stamp in (
        ("resq-01-atmosphere", 260),
        ("resq-02-gathering", 900),
        ("resq-03-formation", 1700),
        ("resq-04-release", 2500),
        ("resq-05-reveal", 3900),
    ):
        await page.evaluate(
            """(t) => {
              const a = document.querySelector('[data-encounter="resq"]');
              if (!a) return;
              a.getAnimations({ subtree: true }).forEach((anim) => {
                anim.pause();
                anim.currentTime = t;
              });
            }""",
            stamp,
        )
        await settle(page, 220)
        await page.screenshot(path=os.path.join(folder, f"{name}.png"))

    await page.evaluate(
        """() => {
          const a = document.querySelector('[data-encounter="resq"]');
          if (!a) return;
          a.getAnimations({ subtree: true }).forEach((anim) => anim.play());
        }"""
    )
    await settle(page, 900)

    wind = await page.evaluate(
        """() => {
          const a = document.querySelector('[data-encounter="resq"]');
          const g = (s) => {
            const el = a.querySelector(s);
            if (!el) return null;
            const c = getComputedStyle(el);
            return { opacity: c.opacity, animation: c.animationName, display: c.display };
          };
          return {
            active: a.dataset.active,
            stage: Math.round(a.querySelector('.wnd-stage').getBoundingClientRect().height),
            formation: g('.wnd-formation'),
            arcs: g('.wnd-arc'),
            ignite: g('.wnd-ignite'),
            title: g('.wnd-title-text'),
            ringCount: a.querySelectorAll('.wnd-arc').length,
            gustCount: a.querySelectorAll('.wnd-gust').length,
            travelCount: a.querySelectorAll('.wnd-travel-mote').length,
            motes: a.querySelectorAll('.wnd-mote').length,
            spirals: a.querySelectorAll('.wnd-spiral').length,
          };
        }"""
    )

    # ---------- seams ----------
    seams = await page.evaluate(
        """() => [...document.querySelectorAll('[data-elemental-seam]')].map((el) => ({
          pair: el.dataset.elementalSeam,
          from: el.dataset.seamFrom,
          to: el.dataset.seamTo,
          top: Math.round(el.getBoundingClientRect().top + scrollY),
          height: Math.round(el.getBoundingClientRect().height),
        }))"""
    )

    async def seam_state(origin):
        for _ in range(12):
            state = await page.evaluate(
                """(from) => {
                  const el = document.querySelector(`[data-seam-from="${from}"]`);
                  return { pair: el.dataset.elementalSeam, dir: el.dataset.direction, active: el.dataset.active };
                }""",
                origin,
            )
            if state["active"] == "true":
                return state
            await page.wait_for_timeout(120)
        return state

    seam_report = []
    for seam in seams:
        await scroll_to(page, seam["top"] - height * 0.42)
        await settle(page, 260)
        state = await seam_state(seam["from"])
        await page.screenshot(path=os.path.join(folder, f"seam-{seam['pair']}.png"))
        await settle(page, 1200)

        # reverse crossing: come back up from below
        await scroll_to(page, seam["top"] + height * 0.9)
        await settle(page, 300)
        await scroll_to(page, seam["top"] - height * 0.42)
        await settle(page, 300)
        reverse = await seam_state(seam["from"])
        await page.screenshot(path=os.path.join(folder, f"seam-reverse-{reverse['pair']}.png"))
        seam_report.append({"forward": state, "reverse": reverse, "height": seam["height"]})

    # ---------- overflow ----------
    overflow = await page.evaluate(
        """() => {
          const doc = document.documentElement;
          return {
            horizontal: doc.scrollWidth - window.innerWidth,
            blockers: [...document.querySelectorAll('.wnd-stage, .wnd-gallery, .wnd-record, .esm, .bw-stage, .wtr-stage, .fyr-stage')]
              .filter((el) => el.getBoundingClientRect().width > window.innerWidth + 1)
              .map((el) => el.className),
          };
        }"""
    )

    # ---------- reduced motion ----------
    await context.close()
    reduced_context = await browser.new_context(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    reduced_page = await reduced_context.new_page()
    await reduced_page.goto(BASE, wait_until="networkidle")
    await settle(reduced_page, 1600)
    await reduced_page.evaluate(SKIP_INTRO)
    await settle(reduced_page, 600)
    await scroll_to(
        reduced_page,
        await reduced_page.evaluate(
            "() => document.querySelector('[data-encounter=\"resq\"]').getBoundingClientRect().top + scrollY"
        ),
    )
    await settle(reduced_page, 1500)
    await reduced_page.screenshot(path=os.path.join(folder, "reduced-resq.png"))
    reduced = await reduced_page.evaluate(
        """() => {
          const a = document.querySelector('[data-encounter="resq"]');
          const g = (s) => {
            const el = a.querySelector(s);
            if (!el) return null;
            const c = getComputedStyle(el);
            return { animation: c.animationName, display: c.display, opacity: c.opacity };
          };
          return {
            title: g('.wnd-title-text'),
            pulse: g('.wnd-pulse'),
            sheet: g('.wnd-sheet'),
            motes: g('.wnd-mote'),
            formation: g('.wnd-formation'),
            animating: a.getAnimations({ subtree: true }).filter((x) => x.playState === 'running').length,
          };
        }"""
    )
    await scroll_to(
        reduced_page,
        await reduced_page.evaluate(
            "() => document.querySelector('[data-seam-from=\"bugwiser\"]').getBoundingClientRect().top + scrollY - 300"
        ),
    )
    await settle(reduced_page, 500)
    await reduced_page.screenshot(path=os.path.join(folder, "reduced-seam.png"))
    reduced["seamAnimating"] = await reduced_page.evaluate(
        "() => document.querySelector('[data-seam-from=\"bugwiser\"]').getAnimations({ subtree: true }).filter((x) => x.playState === 'running').length"
    )
    await reduced_context.close()

    return {
        "viewport": [width, height],
        "assets": assets,
        "boundary": boundary,
        "overflow": overflow,
        "wind": wind,
        "seams": seam_report,
        "reducedMotion": reduced,
        "errors": errors,
    }


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"base": BASE, "viewports": {}}

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, width, height in VIEWPORTS:
            if ONLY and ONLY != label:
                continue
            print(f"— {label} ({width}×{height})")
            report["viewports"][label] = await capture_viewport(
                browser, label, width, height
            )
        await browser.close()

    with open(os.path.join(OUT, "validation.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    print(json.dumps(report, indent=2)[:6000])


asyncio.run(main())
