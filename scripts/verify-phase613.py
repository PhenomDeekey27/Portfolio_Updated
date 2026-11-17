"""Phase 6.13 — production validation.

Checks, against a running production build:

  1. console errors / page errors / hydration warnings on every viewport
  2. horizontal overflow on every viewport
  3. each encounter's technique re-arms when the stage is re-entered from
     below (the phase 6.13 fix) and does not restart while it stays in view
  4. the encounter content stays readable while the technique is reset
  5. Field Archive entries arm, unmask their titles and keep their links
  6. reduced motion: no technique animations, settled content visible
  7. mobile Hidden Leaf construction advances through its stages on a fresh
     load and the hero text arrives promptly
  8. a measured before/after of the mobile sand budget (long-frame share)

Scrolling goes through real wheel events because Lenis owns the scroll; a bare
`window.scrollTo` is undone by Lenis's next frame.

Usage: python scripts/verify-phase613.py [base_url]
"""

import asyncio
import json
import os
import statistics
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
OUT = "screenshots/phase613"
os.makedirs(OUT, exist_ok=True)

VIEWPORTS = [
    (1920, 1080),
    (1366, 768),
    (1024, 768),
    (430, 932),
    (390, 844),
    (375, 812),
]

ENCOUNTERS = ["bugwiser", "resq", "enn-consultancy", "saravaraj-ai"]

FRAME_SAMPLER = """
() => {
  window.__frames = [];
  window.__sampling = true;
  let last = performance.now();
  const loop = (t) => {
    if (!window.__sampling) return;
    window.__frames.push(t - last);
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
"""


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
    steps = timeout_ms // 120
    for _ in range(steps):
        state = await page.evaluate(
            "() => document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null"
        )
        if state in (None, "IDLE"):
            return True
        await page.wait_for_timeout(120)
    return False


async def wheel_to(page, target_js, tolerance=60, max_steps=160):
    """Drive real wheel events until `target_js` (a signed px delta) is ~0."""
    for _ in range(max_steps):
        delta = await page.evaluate(target_js)
        if delta is None:
            return False
        if abs(delta) <= tolerance:
            break
        await page.mouse.wheel(0, max(-900, min(900, delta)))
        await page.wait_for_timeout(70)
    await page.wait_for_timeout(850)
    await wait_idle(page)
    await page.wait_for_timeout(200)
    return True


def stage_top_js(encounter_id, ratio=0.2):
    return f"""() => {{
        const el = document.querySelector('[data-encounter="{encounter_id}"]');
        const stage = el ? el.querySelector('section') : null;
        if (!stage) return null;
        return stage.getBoundingClientRect().top - window.innerHeight * {ratio};
    }}"""


def stage_below_js(encounter_id, ratio=1.18):
    return f"""() => {{
        const el = document.querySelector('[data-encounter="{encounter_id}"]');
        const stage = el ? el.querySelector('section') : null;
        if (!stage) return null;
        return stage.getBoundingClientRect().bottom - window.innerHeight * {ratio};
    }}"""


async def stage_state(page):
    return await page.evaluate(
        """(ids) => Object.fromEntries(ids.map((id) => {
            const el = document.querySelector(`[data-encounter="${id}"]`);
            if (!el) return [id, { active: null, animations: [], titleVisible: false }];
            const stage = el.querySelector('section');
            const title = el.querySelector('h3');
            const animated = stage ? [...stage.getAnimations({ subtree: true })] : [];
            return [id, {
              active: el.getAttribute('data-active'),
              animations: animated.map((a) => a.playState),
              running: animated.filter((a) => a.playState === 'running').length,
              animationCount: animated.length,
              titleVisible: title ? title.getBoundingClientRect().height > 0 : false,
              contentReadable: el.textContent.length > 400,
            }];
          }))""",
        ENCOUNTERS,
    )


async def enter_from_above(page, encounter_id):
    await wheel_to(page, stage_top_js(encounter_id))
    await page.wait_for_timeout(600)


async def check_reentry(page, label):
    results = {}
    for encounter_id in ENCOUNTERS:
        await enter_from_above(page, encounter_id)
        first = (await stage_state(page))[encounter_id]

        # Leave the stage completely: the next section boundary does it.
        await page.mouse.wheel(0, 1600)
        await page.wait_for_timeout(1100)
        await wait_idle(page)
        away = (await stage_state(page))[encounter_id]

        # Return from below.
        await wheel_to(page, stage_below_js(encounter_id))
        await wheel_to(page, stage_top_js(encounter_id), tolerance=40)
        await page.wait_for_timeout(500)
        second = (await stage_state(page))[encounter_id]

        results[encounter_id] = {
            "armed_first_entry": first["active"],
            "running_first_entry": first["running"],
            "reset_while_away": away["active"],
            "animations_reset_while_away": away["animationCount"],
            "animations_after_reentry": second["animationCount"],
            "content_readable_away": away["contentReadable"],
            "rearmed_from_below": second["active"],
            "running_after_reentry": second["running"],
        }
    print(f"  re-entry @ {label}: {json.dumps(results)}")
    return results


async def check_idle(page):
    """While the stage stays in view the sequence must not restart."""
    await enter_from_above(page, "bugwiser")
    await page.wait_for_timeout(6000)
    first = await page.evaluate(
        """() => {
            const stage = document.querySelector('[data-encounter="bugwiser"] section');
            const anims = stage ? [...stage.getAnimations({ subtree: true })] : [];
            return anims.map((a) => a.playState);
        }"""
    )
    await page.wait_for_timeout(1800)
    second = await page.evaluate(
        """() => {
            const stage = document.querySelector('[data-encounter="bugwiser"] section');
            const anims = stage ? [...stage.getAnimations({ subtree: true })] : [];
            return anims.map((a) => a.playState);
        }"""
    )
    restarted = ("running" in second) and ("running" not in first)
    print(f"  idle stability: settled={first.count('finished')} running_now={second.count('running')} restarted={restarted}")
    return {"first": first, "second": second, "restarted": restarted}


async def check_budget_counts(page):
    counts = await page.evaluate(
        """() => {
            const shown = (sel) =>
              [...document.querySelectorAll(sel)].filter(
                (el) => getComputedStyle(el).display !== 'none'
              ).length;
            return {
              sandMotes: shown('.bw-mote'),
              windGusts: shown('.wnd-gust'),
              windTravel: shown('.wnd-travel-mote'),
              windSpray: shown('.wnd-spray'),
              windMotes: shown('.wnd-mote'),
              waterDrops: shown('.wtr-drop'),
              sandDisplacementFilter: getComputedStyle(
                document.querySelector('.bw-wave-upper')
              ).filter,
              windStrokeFilter: getComputedStyle(
                document.querySelector('.wnd-ribbon')
              ).filter,
            };
          }"""
    )
    print(f"  budget counts @390: {json.dumps(counts)}")
    return counts


async def check_scroll_health(page):
    await wheel_to(page, "() => 0")
    await page.wait_for_timeout(400)
    await wheel_to(page, "() => document.documentElement.scrollHeight - window.innerHeight - window.scrollY", tolerance=40)
    await page.wait_for_timeout(1200)
    state = await page.evaluate(
        """() => ({
            htmlOverflow: document.documentElement.style.overflow,
            bodyOverflow: document.body.style.overflow,
            teleport: document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null,
            scrollY: Math.round(window.scrollY),
            atBottom: Math.abs(window.scrollY + window.innerHeight - document.documentElement.scrollHeight) < 4,
        })"""
    )
    print(f"  scroll health: {json.dumps(state)}")
    return state


async def check_archive(page):
    await wheel_to(
        page,
        """() => {
            const el = document.querySelector('.fa');
            if (!el) return 0;
            return el.getBoundingClientRect().top - 100;
        }""",
    )
    await page.wait_for_timeout(1600)
    state = await page.evaluate(
        """() => {
            const cards = [...document.querySelectorAll('.fa-card')];
            return {
              count: cards.length,
              visible: cards.filter((c) => c.dataset.visible === 'true').length,
              titlesUnmasked: cards.map((c) => {
                const t = c.querySelector('.fa-title-text');
                if (!t) return null;
                const m = new DOMMatrixReadOnly(getComputedStyle(t).transform);
                return Math.round(m.m42);
              }),
              links: cards.map((c) => c.getAttribute('href')),
              aspect: cards.map((c) => {
                const m = c.querySelector('.fa-media');
                if (!m) return null;
                const [w, h] = getComputedStyle(m).aspectRatio.split('/');
                return Math.round((Number(w) / Number(h)) * 100) / 100;
              }),
            };
          }"""
    )
    print(f"  archive: {json.dumps(state)}")
    return state


async def check_mobile_world(page):
    """Called on a fresh load, before other scrolling."""
    samples = []
    for _ in range(13):
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
                        .map((k) => world.dataset[k])
                        .join(','),
                      ridgeOpacity: Number(getComputedStyle(world.querySelector('.lw-ridge')).opacity),
                      litWindows: world.querySelectorAll('.lw-window').length,
                      lamps: world.querySelectorAll('.lw-lamp').length,
                      motes: world.querySelectorAll('.lw-mote').length,
                      dioramaDisplay: getComputedStyle(world.querySelector('.lw-diorama')).display,
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
    print(f"  mobile world: {json.dumps(samples)} heroOpacity={hero}")
    return {"samples": samples, "heroOpacity": hero}


async def sample_frames(page, steps, step_pause):
    await page.evaluate(FRAME_SAMPLER)
    for _ in range(steps):
        await page.mouse.wheel(0, 150)
        await page.wait_for_timeout(step_pause)
    frames = await page.evaluate(
        """() => { window.__sampling = false; return window.__frames; }"""
    )
    frames = [f for f in frames if f > 0]
    if not frames:
        return None
    long_frames = [f for f in frames if f > 33.4]
    return {
        "frames": len(frames),
        "p50": round(statistics.median(frames), 1),
        "p95": round(sorted(frames)[int(len(frames) * 0.95) - 1], 1),
        "long_share_pct": round(len(long_frames) / len(frames) * 100, 1),
        "max": round(max(frames), 1),
    }


OVERRIDE = """
  @media (max-width: 1023px) {
    .bw-wave-upper, .bw-wave-lower { filter: url(#bw-sand-rough) !important; }
    .bw-motes-stream .bw-mote:nth-child(n + 11),
    .bw-motes-burst .bw-mote:nth-child(n + 9) { display: block !important; }
    .wnd-ribbon, .wnd-current { filter: drop-shadow(0 0 16px rgb(103 232 249 / 0.12)) !important; }
    .wnd-gusts .wnd-gust:nth-child(n + 17),
    .wnd-travel .wnd-travel-mote:nth-child(n + 13),
    .wnd-motes .wnd-mote:nth-child(n + 17),
    .wtr-drops .wtr-drop:nth-child(n + 13) { display: block !important; }
  }
"""


async def measure_mobile_budget(page):
    """A/B the mobile sand budget on one page: 6.12 behaviour vs 6.13."""
    cdp = await page.context.new_cdp_session(page)
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

    async def run(label, with_override):
        handle = await page.add_style_tag(content=OVERRIDE) if with_override else None
        runs = []
        for _ in range(3):
            await wheel_to(page, stage_below_js("bugwiser", 1.25), tolerance=80)
            await wheel_to(page, stage_top_js("bugwiser", 0.3), tolerance=80)
            runs.append(await sample_frames(page, steps=24, step_pause=60))
        if handle:
            await handle.evaluate("(el) => el.remove()")
        merged = [r for r in runs if r]
        if not merged:
            return None
        result = {
            "samples": merged,
            "mean_p50": round(statistics.mean(r["p50"] for r in merged), 1),
            "mean_p95": round(statistics.mean(r["p95"] for r in merged), 1),
            "mean_long_share": round(statistics.mean(r["long_share_pct"] for r in merged), 1),
        }
        print(f"  mobile sand budget [{label}]: {json.dumps(result)}")
        return result

    # Interleave the two conditions twice so drift does not favour either one.
    baseline = await run("6.12 behaviour", True)
    optimised = await run("6.13 behaviour", False)
    baseline2 = await run("6.12 behaviour (rerun)", True)
    optimised2 = await run("6.13 behaviour (rerun)", False)

    def mean_of(a, b, key):
        vals = [x[key] for x in (a, b) if x]
        return round(statistics.mean(vals), 1) if vals else None

    summary = {
        "throttle": "4x CPU",
        "viewport": "390x844",
        "baseline": {"mean_p50": mean_of(baseline, baseline2, "mean_p50"), "mean_p95": mean_of(baseline, baseline2, "mean_p95"), "mean_long_share": mean_of(baseline, baseline2, "mean_long_share")},
        "optimised": {"mean_p50": mean_of(optimised, optimised2, "mean_p50"), "mean_p95": mean_of(optimised, optimised2, "mean_p95"), "mean_long_share": mean_of(optimised, optimised2, "mean_long_share")},
    }
    print(f"  mobile sand budget summary: {json.dumps(summary)}")
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 1})
    return summary


async def main():
    report = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for width, height in VIEWPORTS:
            name = f"{width}x{height}"
            ctx = await browser.new_context(viewport={"width": width, "height": height})
            page = await ctx.new_page()
            issues = []
            page.on(
                "console",
                lambda m: issues.append(f"console:{m.type}:{m.text[:160]}")
                if m.type == "error"
                else None,
            )
            page.on("pageerror", lambda e: issues.append(f"pageerror:{str(e)[:160]}"))

            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1200)

            entry = {}
            if (width, height) == (390, 844):
                # Fresh load: observe the construction before touching the page.
                entry["mobile_world"] = await check_mobile_world(page)
                await shot(page, f"{OUT}/mobile-world-{name}.png")

            await dismiss_intro(page)
            await page.wait_for_timeout(1500)
            await shot(page, f"{OUT}/home-{name}.png")

            overflow = await page.evaluate(
                "() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth })"
            )
            entry["horizontal_overflow"] = overflow["doc"] > overflow["win"] + 1
            entry["issues"] = issues[:8]
            entry["hydration_warnings"] = [i for i in issues if "hydrat" in i.lower()][:4]

            if (width, height) in ((1366, 768), (390, 844)):
                entry["reentry"] = await check_reentry(page, name)
                await shot(page, f"{OUT}/encounter-{name}.png")
                entry["archive"] = await check_archive(page)
                await shot(page, f"{OUT}/archive-{name}.png")

            if (width, height) == (390, 844):
                entry["idle"] = await check_idle(page)
                await shot(page, f"{OUT}/sand-idle-{name}.png")
                entry["budget_counts"] = await check_budget_counts(page)
                entry["scroll_health"] = await check_scroll_health(page)
                entry["budget"] = await measure_mobile_budget(page)
                entry["issues_after"] = issues[:10]

            report[name] = entry
            await ctx.close()

        # Reduced motion
        ctx = await browser.new_context(
            viewport={"width": 1366, "height": 768}, reduced_motion="reduce"
        )
        page = await ctx.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1400)
        await dismiss_intro(page)
        await page.wait_for_timeout(2000)
        await wheel_to(page, stage_top_js("bugwiser"))
        await page.wait_for_timeout(1500)
        reduced = await page.evaluate(
            """() => {
                const el = document.querySelector('[data-encounter="bugwiser"]');
                const stage = el ? el.querySelector('section') : null;
                const title = el ? el.querySelector('.bw-title-text') : null;
                const world = document.querySelector('.leaf-world');
                return {
                  encounterAnimations: stage ? stage.getAnimations({ subtree: true }).length : null,
                  titleOpacity: title ? getComputedStyle(title).opacity : null,
                  titleHeight: title ? title.getBoundingClientRect().height : null,
                  introVisible: el ? el.textContent.includes('root cause') : null,
                  leafWorld: Boolean(world),
                  motesVisible: world
                    ? getComputedStyle(world.querySelector('.lw-motes')).display
                    : null,
                  ridgeOpacity: world
                    ? getComputedStyle(world.querySelector('.lw-ridge')).opacity
                    : null,
                };
              }"""
        )
        print(f"  reduced motion: {json.dumps(reduced)}")
        report["reduced_motion"] = reduced
        await shot(page, f"{OUT}/reduced-motion-1366.png")
        await ctx.close()

        await browser.close()

    with open(f"{OUT}/report.json", "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    print("\nwrote", f"{OUT}/report.json")


asyncio.run(main())
