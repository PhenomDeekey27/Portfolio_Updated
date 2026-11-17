"""Phase 6.6 — capture and validate all four Jutsu Theatre encounters.

Per viewport (1920x1080, 1366x768, 390x844):
  * settled viewport, full scene element and full record element for each
    encounter (BugWiser included, unchanged);
  * layout metrics: overflow, clipped/out-of-viewport text, copy/plate overlap,
    minimum rendered text size, links;
  * reduced-motion state and running-animation count.

Sequence filmstrips for the three new encounters at 1920 and 390, timed from
the moment `data-active` flips (armed via a MutationObserver installed before
navigation).

Usage: BASE=http://localhost:3001 python scripts/capture-jutsu-theatre.py
"""

import asyncio
import json
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase66"
VIEWPORTS = [("1920", 1920, 1080), ("1366", 1366, 768), ("390", 390, 844)]
ENCOUNTERS = ["bugwiser", "resq", "enn-consultancy", "saravaraj-ai"]
NEW_ENCOUNTERS = ["resq", "enn-consultancy", "saravaraj-ai"]
STAGES = [(150, "01-enter"), (750, "02-sign"), (1400, "03-reveal"), (2200, "04-plate")]

ARM_SCRIPT = """
window.__armed = {};
const mark = () => {
  document.querySelectorAll('[data-encounter]').forEach((el) => {
    if (el.dataset.active === 'true' && !window.__armed[el.dataset.encounter]) {
      window.__armed[el.dataset.encounter] = performance.now();
    }
  });
};
const startWatching = () => {
  mark();
  new MutationObserver(mark).observe(document.documentElement, {
    subtree: true, attributes: true, attributeFilter: ['data-active'],
  });
  setInterval(mark, 80);
};
if (document.documentElement) startWatching();
else document.addEventListener('DOMContentLoaded', startWatching, { once: true });
"""

METRICS_JS = """
(id) => {
  const a = document.querySelector(`[data-encounter="${id}"]`);
  const scene = a.querySelector('.sd-scene, .jt-scene');
  const copy = a.querySelector('.sd-copy, .jt-copy');
  const title = a.querySelector('.sd-title-text, .jt-title-text');
  const plate = a.querySelector('.sd-plate, .jt-plate');
  const figure = a.querySelector('.sd-figure, .jt-figure');
  const record = a.querySelector('.sd-record');
  const rect = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), right: +b.right.toFixed(1), bottom: +b.bottom.toFixed(1) };
  };
  const textEls = [...a.querySelectorAll('h3,p,li,dt,dd,a,figcaption')].filter(
    (el) => el.textContent.trim() && !el.closest('[aria-hidden="true"]')
  );
  const sizes = textEls
    .map((el) => parseFloat(getComputedStyle(el).fontSize))
    .filter((n) => Number.isFinite(n));
  const clipped = textEls
    .filter((el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2)
    .map((el) => ({ tag: el.tagName, cls: el.className, text: el.textContent.trim().slice(0, 48), scroll: el.scrollWidth, client: el.clientWidth }));
  const outside = textEls
    .map((el) => ({ el, b: el.getBoundingClientRect() }))
    .filter(({ b }) => b.width > 0 && (b.right > window.innerWidth + 1 || b.left < -1))
    .map(({ el, b }) => ({ tag: el.tagName, cls: el.className, text: el.textContent.trim().slice(0, 48), left: +b.left.toFixed(1), right: +b.right.toFixed(1) }));
  const links = [...a.querySelectorAll('a')].map((el) => ({
    label: el.getAttribute('aria-label') || el.textContent.trim(),
    href: el.getAttribute('href'),
    target: el.getAttribute('target'),
    rel: el.getAttribute('rel'),
    minTouch: Math.round(el.getBoundingClientRect().height),
  }));
  const overlap = copy && plate ? !(copy.getBoundingClientRect().right <= plate.getBoundingClientRect().left + 1 ||
    plate.getBoundingClientRect().right <= copy.getBoundingClientRect().left + 1 ||
    copy.getBoundingClientRect().bottom <= plate.getBoundingClientRect().top + 1 ||
    plate.getBoundingClientRect().bottom <= copy.getBoundingClientRect().top + 1) : null;
  return {
    viewport: [window.innerWidth, window.innerHeight],
    active: a.dataset.active,
    character: a.dataset.character,
    scene: rect(scene),
    figure: rect(figure),
    copy: rect(copy),
    title: rect(title),
    plate: rect(plate),
    record: rect(record),
    titleFont: title ? getComputedStyle(title).fontSize : null,
    minTextPx: sizes.length ? Math.min(...sizes) : null,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    clipped,
    outside,
    overlap,
    links,
    linkCount: links.length,
    clientLinks: links.filter((l) => !l.href).length,
    revealPhase: a.closest('[data-reveal-phase]')?.dataset.revealPhase ?? null,
  };
}
"""

SEQ_JS = """
(id) => {
  const a = document.querySelector(`[data-encounter="${id}"]`);
  const read = (sel) => {
    const el = a.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      opacity: cs.opacity,
      clip: cs.clipPath,
      maskPos: cs.maskPosition,
      running: el.getAnimations().filter((x) => x.playState === 'running').length,
    };
  };
  return { title: read('.jt-title-text'), plate: read('.jt-plate-screen'), figure: read('.jt-figure') };
}
"""

REDUCED_JS = """
(id) => {
  const a = document.querySelector(`[data-encounter="${id}"]`);
  const running = [];
  for (const el of a.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.animationName === 'none') continue;
    const parts = cs.animationDuration.split(',').map((v) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v)));
    if (Math.max(...parts) > 0.01) running.push(cs.animationName);
  }
  const title = a.querySelector('.sd-title-text, .jt-title-text');
  const figure = a.querySelector('.sd-figure, .jt-figure');
  const plate = a.querySelector('.sd-plate, .jt-plate');
  const scene = a.querySelector('.sd-scene, .jt-scene');
  return {
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    running: [...new Set(running)],
    titleOpacity: title ? getComputedStyle(title).opacity : null,
    titleMask: title ? getComputedStyle(title).maskImage : null,
    figureOpacity: figure ? getComputedStyle(figure).opacity : null,
    plateOpacity: plate ? getComputedStyle(plate).opacity : null,
    sceneHeight: Math.round(scene.getBoundingClientRect().height),
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
  };
}
"""


async def enter(page):
    await page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(1100)
    skip = page.get_by_role("button", name="Skip intro")
    if await skip.count():
        try:
            await skip.first.click(timeout=2500)
        except Exception:
            # The intro may finish on its own mid-click; the page is usable.
            pass
        await page.wait_for_timeout(600)


async def park(page, encounter_id, offset=30):
    await page.evaluate(
        """([id, off]) => {
            const el = document.querySelector(`[data-encounter="${id}"]`);
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: 'instant' });
        }""",
        [encounter_id, offset],
    )


async def wait_armed(page, encounter_id, timeout=15000):
    await page.wait_for_function(
        f"() => window.__armed && window.__armed['{encounter_id}'] !== undefined",
        timeout=timeout,
    )


async def elapsed_since_armed(page, encounter_id):
    return await page.evaluate(
        f"() => performance.now() - window.__armed['{encounter_id}']"
    )


async def settled_run(browser, label, width, height):
    page = await browser.new_page(viewport={"width": width, "height": height})
    await page.add_init_script(ARM_SCRIPT)
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    await enter(page)
    folder = os.path.join(OUT, label)
    os.makedirs(folder, exist_ok=True)
    results = []

    for encounter_id in ENCOUNTERS:
        await park(page, encounter_id)
        await wait_armed(page, encounter_id)
        elapsed = await elapsed_since_armed(page, encounter_id)
        if elapsed < 3600:
            await page.wait_for_timeout(3600 - elapsed)
        await park(page, encounter_id)

        enc_folder = os.path.join(folder, encounter_id)
        os.makedirs(enc_folder, exist_ok=True)
        await page.screenshot(path=os.path.join(enc_folder, "viewport-settled.png"))

        scene = page.locator(
            f'[data-encounter="{encounter_id}"] .sd-scene, [data-encounter="{encounter_id}"] .jt-scene'
        ).first
        await scene.screenshot(path=os.path.join(enc_folder, "scene.png"))

        record = page.locator(f'[data-encounter="{encounter_id}"] .sd-record').first
        await record.scroll_into_view_if_needed()
        actions = page.locator(f'[data-encounter="{encounter_id}"] .sd-actions').first
        if await actions.count():
            # The actions row is the last one-time Reveal in the record. Centre
            # it: aligning it to the viewport edge keeps it outside the Reveal's
            # -8% bottom root margin, so it would never be painted.
            await actions.evaluate(
                "(el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })"
            )
        await page.wait_for_timeout(1400)
        await record.screenshot(path=os.path.join(enc_folder, "record.png"))
        await page.screenshot(path=os.path.join(enc_folder, "record-viewport.png"))
        record_visibility = await page.evaluate(
            """(id) => {
              const a = document.querySelector(`[data-encounter="${id}"]`);
              const els = [...a.querySelectorAll('.sd-record p, .sd-record li, .sd-record dt, .sd-record dd, .sd-record a')];
              const opaque = (el) => {
                if (!el.checkVisibility()) return false;
                for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
                  if (parseFloat(getComputedStyle(n).opacity) < 0.05) return false;
                }
                return true;
              };
              const visible = els.filter(opaque);
              return { total: els.length, visible: visible.length };
            }""",
            encounter_id,
        )

        await park(page, encounter_id)
        await page.wait_for_timeout(250)
        metrics = await page.evaluate(METRICS_JS, encounter_id)
        results.append(
            {"id": encounter_id, "metrics": metrics, "recordVisibility": record_visibility}
        )

        # Return to the top of the encounter for the next pass.
        await park(page, encounter_id)

    await page.close()
    return {"label": label, "encounters": results, "errors": errors}


async def reduced_run(browser, label, width, height):
    page = await browser.new_page(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    await enter(page)
    out = []
    for encounter_id in ENCOUNTERS:
        await park(page, encounter_id)
        await page.wait_for_timeout(900)
        await page.screenshot(
            path=os.path.join(OUT, label, encounter_id, "reduced-motion.png")
        )
        out.append(
            {"id": encounter_id, "reduced": await page.evaluate(REDUCED_JS, encounter_id)}
        )
    await page.close()
    return out


async def sequence_check(browser):
    """Proves the beats actually run: sample computed state early and settled."""
    page = await browser.new_page(
        viewport={"width": 1920, "height": 1080}, reduced_motion="no-preference"
    )
    await page.add_init_script(ARM_SCRIPT)
    await enter(page)
    out = []
    for encounter_id in NEW_ENCOUNTERS:
        await park(page, encounter_id)
        await wait_armed(page, encounter_id)
        await park(page, encounter_id)
        await page.wait_for_timeout(300)
        early = await page.evaluate(SEQ_JS, encounter_id)
        elapsed = await elapsed_since_armed(page, encounter_id)
        # Fixed settle wait: the arming timestamp can be older than the moment
        # the page's timeline actually starts on a freshly loaded page.
        await page.wait_for_timeout(3800)
        late = await page.evaluate(SEQ_JS, encounter_id)
        out.append(
            {"id": encounter_id, "armedToEarlyMs": round(elapsed), "early": early, "settled": late}
        )
    await page.close()
    return out


async def filmstrip_run(browser, label, width, height):
    page = await browser.new_page(viewport={"width": width, "height": height})
    await page.add_init_script(ARM_SCRIPT)
    await enter(page)
    out = []
    for encounter_id in NEW_ENCOUNTERS:
        await park(page, encounter_id)
        await wait_armed(page, encounter_id)
        await park(page, encounter_id)
        folder = os.path.join(OUT, label, encounter_id)
        os.makedirs(folder, exist_ok=True)
        for at, name in STAGES:
            elapsed = await elapsed_since_armed(page, encounter_id)
            wait = at - elapsed
            if wait > 0:
                await page.wait_for_timeout(wait)
            await page.screenshot(path=os.path.join(folder, f"seq-{name}.png"))
        out.append(encounter_id)
    await page.close()
    return out


async def main():
    os.makedirs(OUT, exist_ok=True)
    summary = {"viewports": [], "sequence": []}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, w, h in VIEWPORTS:
            settled = await settled_run(browser, label, w, h)
            reduced = await reduced_run(browser, label, w, h)
            summary["viewports"].append(
                {"label": label, **settled, "reducedMotion": reduced}
            )
            print("settled", label)
        for label, w, h in [("1920", 1920, 1080), ("390", 390, 844)]:
            await filmstrip_run(browser, label, w, h)
            print("filmstrip", label)
        summary["sequence"] = await sequence_check(browser)
        print("sequence check")
        await browser.close()

    with open(os.path.join(OUT, "report.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=1)

    # Console summary of anything that needs attention.
    for row in summary["sequence"]:
        early_title = row["early"]["title"]
        settled_title = row["settled"]["title"]
        early_plate = row["early"]["plate"]
        print(
            "sequence",
            row["id"],
            "early title",
            early_title["opacity"],
            early_title["maskPos"],
            "settled",
            settled_title["opacity"],
            "plate early",
            early_plate["clip"],
            "settled",
            row["settled"]["plate"]["clip"],
        )

    for vp in summary["viewports"]:
        for enc in vp["encounters"]:
            m = enc["metrics"]
            flags = []
            if m["overflowX"] > 0:
                flags.append(f"overflowX={m['overflowX']}")
            if m["clipped"]:
                flags.append(f"clipped={len(m['clipped'])}")
            if m["outside"]:
                flags.append(f"outside={len(m['outside'])}")
            if m["overlap"]:
                flags.append("copy/plate overlap")
            rv = enc.get("recordVisibility") or {}
            if rv and (rv.get("total", 0) == 0 or rv.get("visible", 0) != rv.get("total")):
                flags.append(f"record {rv.get('visible')}/{rv.get('total')} visible")
            if m["minTextPx"] and m["minTextPx"] < 8:
                flags.append(f"minText={m['minTextPx']}")
            print(vp["label"], enc["id"], "OK" if not flags else " | ".join(flags))
        for red in vp["reducedMotion"]:
            r = red["reduced"]
            if r["running"] or r["titleOpacity"] != "1" or r["titleMask"] != "none":
                print(vp["label"], red["id"], "REDUCED FAIL", r["running"], r["titleOpacity"], r["titleMask"])


asyncio.run(main())
