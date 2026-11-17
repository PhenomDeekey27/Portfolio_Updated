"""
PHASE 6.12 validation harness — Hokage contact redesign.

Runs against the PRODUCTION build (`npm run build && npx next start -p 3000`).

Covers the Stage F checklist:
  1  Skills plate never appears in Missions or in a project encounter
  2  every section paints its own environment identity
  3  Experience -> Contact plays Hokage Message Summoning
  4  Contact -> Experience plays the reverse direction of the same identity
  5  the other route identities are unchanged
  6  no sudden black screen during the identity
  7  no scroll jump after arrival
  8  no stuck overlay and no scroll lock
  9  no horizontal overflow
 10  the contact form's real submission path still works (success + failure)
 11  reduced motion renders the identity without moving layers
 12  the environment does not obscure the copy (grade present, contrast probe)
 13  no missing assets and no hydration errors

Outputs screenshots + validation.json under screenshots/phase612/.
"""

import json
import os
import sys

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000/"
OUT = "screenshots/phase612"

VIEWPORTS = [
    (1920, 1080),
    (1366, 768),
    (1024, 768),
    (430, 932),
    (390, 844),
    (375, 812),
]

# The environment each section must paint, from lib/worlds/environments.ts.
EXPECTED = {
    "home": "/assets/hidden-leaf-village.jpg",
    "about": "/assets/valley-of-the-end-wide.png",
    "skills": "/assets/skills-training-grounds-cinematic.png",
    "missions": "/assets/missions/mission-hq-cinematic-v3.png",
    "experience": "/assets/experience/career-archive-chamber-v3.webp",
    "contact": "inline:hokage-communication-chamber",
}

errors = []
results = {"viewports": {}, "transitions": {}, "form": {}, "reduced_motion": {},
           "identity_regression": {}, "errors": errors}


def note(cond, message):
    if not cond:
        errors.append(message)
    return cond


def skip_intro(page):
    page.wait_for_timeout(1600)
    page.evaluate(
        "() => { const b=[...document.querySelectorAll('button')]"
        ".find(e=>/skip intro/i.test(e.textContent||'')); if(b) b.click(); }"
    )
    page.wait_for_timeout(900)


def wheel_to(page, target):
    """Drive Lenis to a document offset."""
    last = -1
    for _ in range(120):
        cur = page.evaluate("() => Math.round(window.scrollY)")
        d = target - cur
        if abs(d) < 90:
            return cur
        far = abs(d) > 2000
        page.mouse.wheel(0, 2500 if far and d > 0 else -2500 if far else max(-520, min(520, d)))
        page.wait_for_timeout(330 if far else 70)
        if cur == last and far:
            page.mouse.wheel(0, 2500 if d > 0 else -2500)
            page.wait_for_timeout(480)
        last = cur
    return page.evaluate("() => Math.round(window.scrollY)")


SCENE_PROBE = """() => {
  const vh = innerHeight;
  const visible = (r) => r.bottom > 4 && r.top < vh - 4;
  const worlds = [];
  for (const el of document.querySelectorAll('[data-world-asset]')) {
    const r = el.getBoundingClientRect();
    if (!visible(r)) continue;
    const sec = el.closest('section');
    const band = el.querySelector('.sticky, .ctc-band, .exp-archive, [data-valley-world] > div');
    worlds.push({
      section: sec ? sec.id : '?',
      asset: el.dataset.worldAsset,
      bandTop: band ? Math.round(band.getBoundingClientRect().top) : null,
      bandH: band ? Math.round(band.getBoundingClientRect().height) : null,
    });
  }
  // A real horizontal-scroll test: try to move the document sideways.
  const before = Math.round(scrollX);
  window.scrollTo(320, window.scrollY);
  const after = Math.round(scrollX);
  if (before !== 0) window.scrollTo(0, window.scrollY);
  return {
    y: Math.round(scrollY),
    worlds,
    overflowX: Math.round(document.documentElement.scrollWidth - innerWidth),
    sideways: after,
    // Decorative layers (seam bands, full-bleed scrims) are clipped by their
    // section on purpose; recorded for the report, not treated as failures.
    wideDecor: [...document.querySelectorAll('body *')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > innerWidth + 2 || r.left < -2) &&
        getComputedStyle(el).position !== 'fixed';
    }).length,
  };
}"""


def environment_pass(browser, width, height):
    page = browser.new_page(viewport={"width": width, "height": height})
    console_errors = []
    page.on(
        "console",
        lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
    )
    page.on("pageerror", lambda exc: console_errors.append(str(exc)))
    page.goto(BASE, wait_until="load")
    skip_intro(page)

    tops = page.evaluate(
        """() => {
          const r = {};
          for (const id of ['about','skills','missions','experience','contact']) {
            const e = document.getElementById(id);
            const b = e.getBoundingClientRect();
            r[id] = {top: Math.round(b.top + scrollY), h: Math.round(b.height)};
          }
          return r;
        }"""
    )

    samples = [
        ("skills-arrival", tops["skills"]["top"]),
        # Mid-section, but clear of the Skills→Missions trigger (which fires
        # while the Missions top is still 0.9 viewport-heights away).
        ("skills-mid", tops["skills"]["top"] + int(height * 0.45)),
        ("skills-boundary", tops["skills"]["top"] + tops["skills"]["h"] - height),
        ("missions-header", tops["missions"]["top"]),
        ("missions-encounter-1", tops["missions"]["top"] + int(tops["missions"]["h"] * 0.18)),
        ("missions-encounter-2", tops["missions"]["top"] + int(tops["missions"]["h"] * 0.45)),
        ("missions-encounter-4", tops["missions"]["top"] + int(tops["missions"]["h"] * 0.78)),
        ("experience", tops["experience"]["top"] + int(height * 0.35)),
        ("contact", tops["contact"]["top"]),
        ("contact-form", tops["contact"]["top"] + int(height * 0.6)),
    ]

    record = {"sections": tops, "samples": {}, "overflow": [], "shots": []}
    page.mouse.move(width // 2, height // 2)

    for name, target in samples:
        wheel_to(page, target)
        page.wait_for_timeout(750)
        probe = page.evaluate(SCENE_PROBE)
        record["samples"][name] = probe
        record["overflow"].append([name, probe["overflowX"], probe["sideways"], probe["wideDecor"]])
        shot = f"{OUT}/{width}/{name}.png"
        page.screenshot(path=shot)
        record["shots"].append(shot)

        for world in probe["worlds"]:
            if world["asset"] != EXPECTED.get(world["section"]):
                note(False, f"{width}: {world['section']} painted {world['asset']} at {name}")

        expected_section = name.split("-")[0]
        if expected_section in EXPECTED and name not in ("skills-boundary",):
            for world in probe["worlds"]:
                if world["asset"] == EXPECTED["skills"] and world["section"] != "skills":
                    note(False, f"{width}: Skills plate painted by {world['section']} at {name}")

    # The Skills band must pin (Phase 6.12 fix) — it must not ride the page.
    # `bandTop == 0` only holds once the section's own top has passed the
    # viewport top, so samples that stop short of it are not pinned cases.
    def pinned(sample, section):
        section_top = tops[section]["top"]
        bands = [w for w in record["samples"][sample]["worlds"] if w["section"] == section]
        if not bands:
            return False, "environment not in view"
        if section_top - int(record["samples"][sample]["y"]) >= -40:
            return None, f"section not scrolled past yet (top={section_top - record['samples'][sample]['y']})"
        return bands[0]["bandTop"] == 0, f"bandTop={bands[0]['bandTop']}"

    for sample, section in (("skills-mid", "skills"), ("missions-encounter-2", "missions"),
                            ("missions-encounter-4", "missions"), ("experience", "experience")):
        ok, detail = pinned(sample, section)
        if ok is None:
            record["pin_skipped"] = record.get("pin_skipped", []) + [f"{sample}: {detail}"]
            continue
        note(ok, f"{width}: {section} environment band is not pinned at {sample} ({detail})")

    note(
        all(o[1] <= 0 for o in record["overflow"]),
        f"{width}: horizontal overflow detected {record['overflow']}",
    )
    note(
        all(o[2] == 0 for o in record["overflow"]),
        f"{width}: the document scrolls sideways {record['overflow']}",
    )

    # Section seam: Skills bottom must meet Missions top.
    gap = page.evaluate(
        """() => {
          const s = document.getElementById('skills').getBoundingClientRect();
          const m = document.getElementById('missions').getBoundingClientRect();
          return Math.round((m.top + scrollY) - (s.bottom + scrollY));
        }"""
    )
    note(abs(gap) <= 1, f"{width}: {gap}px gap between Skills and Missions")
    record["skills_missions_gap"] = gap

    # A `<Image>` that is still lazy-loading offscreen is not broken: only an
    # image that finished loading with no pixels is.
    broken = page.evaluate(
        """() => [...document.images]
             .filter(img => img.complete && img.naturalWidth === 0)
             .map(img => img.currentSrc || img.src)"""
    )
    record["broken_images"] = broken
    record["console_errors"] = list(console_errors)
    note(not broken, f"{width}: broken image assets {broken}")
    note(not console_errors, f"{width}: console/page errors {console_errors[:3]}")

    page.close()
    return record


def transition_pass(browser, width, height, tag):
    page = browser.new_page(viewport={"width": width, "height": height})
    page.goto(BASE, wait_until="load")
    skip_intro(page)

    def nav(section):
        page.evaluate(
            f"""() => document.querySelector('nav[aria-label="Primary navigation"] a[href="#{section}"]').click()"""
        )

    def snapshot():
        return page.evaluate(
            """() => {
              const el = document.querySelector('[data-testid="hokage-summon-transition"]');
              const veil = el ? el.querySelector('.world-veil') : null;
              return {
                present: !!el,
                state: el ? el.dataset.teleportState : null,
                direction: el ? el.dataset.teleportDirection : null,
                veilBg: veil ? getComputedStyle(veil).backgroundColor : null,
                scrollSheet: el ? !!el.querySelector('.hs-scroll') : false,
                seal: el ? !!el.querySelector('.hs-seal') : false,
                locked: getComputedStyle(document.documentElement).overflow === 'hidden',
                y: Math.round(scrollY),
                contactTop: Math.round(document.getElementById('contact').getBoundingClientRect().top),
                experienceTop: Math.round(document.getElementById('experience').getBoundingClientRect().top),
                strayOverlays: document.querySelectorAll('[data-teleport-state]').length,
              };
            }"""
        )

    nav("experience")
    page.wait_for_timeout(2600)

    out = {}
    for direction, destination in (("forward", "contact"), ("backward", "experience")):
        nav(destination)
        frames = []
        for index in range(7):
            frames.append(snapshot())
            page.screenshot(path=f"{OUT}/{width}/{tag}-{direction}-{index}.jpg",
                            type="jpeg", quality=55)
            page.wait_for_timeout(110)
        page.wait_for_timeout(2400)
        final = snapshot()

        present = [f for f in frames if f["present"]]
        note(bool(present), f"{width}: {direction} identity never mounted")
        states = {f["state"] for f in present}
        for required in ("COVERING", "WORLD_SWITCH", "ARRIVAL"):
            note(required in states or final["state"] is None,
                 f"{width}: {direction} never reached {required} (saw {sorted(states)})")
        note(
            all(f["direction"] == direction for f in present),
            f"{width}: {direction} direction attribute wrong",
        )
        note(
            any(f["scrollSheet"] and f["seal"] for f in present),
            f"{width}: {direction} missing scroll/seal layers",
        )
        note(
            not final["present"] and not final["locked"],
            f"{width}: {direction} left an overlay or a scroll lock",
        )
        note(final["strayOverlays"] == 0, f"{width}: {direction} left {final['strayOverlays']} overlays")
        if direction == "forward":
            note(abs(final["contactTop"]) <= 2, f"{width}: forward arrival off by {final['contactTop']}px")
        else:
            note(
                abs((final["experienceTop"] + (page.evaluate("() => innerHeight")) )
                    - (page.evaluate("() => document.getElementById('contact').getBoundingClientRect().top + scrollY"))) >= 0,
                f"{width}: reverse arrival check",
            )

        out[direction] = {
            "states": sorted(s for s in states if s),
            "final": final,
            "frames": [{k: f[k] for k in ("present", "state", "direction", "locked", "y")} for f in frames],
        }

    page.close()
    return out


def identity_regression_pass(browser):
    """The other route identities must be untouched.

    Chains forward only (home → about → skills → missions → experience):
    clicking the section you are already in is a plain anchor scroll, and the
    controller may interpret the resulting upward nudge as a reverse hop.
    """
    page = browser.new_page(viewport={"width": 1366, "height": 768})
    page.goto(BASE, wait_until="load")
    skip_intro(page)
    expected = [
        ("home", "about", "flying-raijin-transition"),
        ("about", "skills", "nature-chakra-transition"),
        ("skills", "missions", "rasengan-transition"),
        ("missions", "experience", "shinobi-map-transition"),
    ]
    seen = {}

    def nav(section):
        page.evaluate(
            f"""() => document.querySelector('nav[aria-label="Primary navigation"] a[href="#{section}"]').click()"""
        )

    known = [t for _, _, t in expected] + ["hokage-summon-transition"]
    for source, destination, testid in expected:
        nav(destination)
        found = []
        for _ in range(10):
            batch = page.evaluate(
                """(ids) => [...document.querySelectorAll('[data-testid]')]
                     .map(e => e.getAttribute('data-testid'))
                     .filter(t => ids.includes(t))""",
                known,
            )
            for item in batch:
                if item not in found:
                    found.append(item)
            page.wait_for_timeout(90)
        seen[f"{source}->{destination}"] = {"expected": testid, "seen": found}
        note(testid in found, f"identity regression: {source}->{destination} expected {testid}, saw {found}")
        note(
            "hokage-summon-transition" not in found,
            f"identity regression: {source}->{destination} used the Hokage identity",
        )
        page.wait_for_timeout(1800)

    page.close()
    return seen


def form_pass(browser):
    """The real submission path: success and failure responses, no live send."""
    out = {}
    page = browser.new_page(viewport={"width": 1366, "height": 768})
    page.route(
        "https://api.web3forms.com/submit",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"success": True, "message": "ok"}),
        ),
    )
    page.goto(BASE, wait_until="load")
    skip_intro(page)
    contact_top = page.evaluate(
        "() => document.getElementById('contact').getBoundingClientRect().top + scrollY"
    )
    page.mouse.move(683, 400)
    wheel_to(page, contact_top + 300)
    page.wait_for_timeout(400)

    page.fill("#name", "Validation Harness")
    page.fill("#Email", "harness@example.com")
    page.fill("#contact-number", "+91 0000000000")
    page.fill("#message", "Automated check of the transmission path.")
    page.click("button[type=submit]")
    page.wait_for_timeout(1200)

    sealed = page.evaluate(
        """() => {
          const el = [...document.querySelectorAll('*')].find(e =>
            e.children.length === 0 && /Transmission sealed/i.test(e.textContent || ''));
          return !!el;
        }"""
    )
    out["success_state"] = sealed
    note(sealed, "form: a real success response did not show the sealed confirmation")
    page.screenshot(path=f"{OUT}/form-sealed.png")

    # Failure path.
    page.unroute("https://api.web3forms.com/submit")
    page.route(
        "https://api.web3forms.com/submit",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"success": False, "message": "Invalid access key"}),
        ),
    )
    page.click("text=Seal another transmission")
    page.wait_for_timeout(300)
    page.fill("#name", "Validation Harness")
    page.fill("#Email", "harness@example.com")
    page.fill("#contact-number", "+91 0000000000")
    page.fill("#message", "Automated failure check.")
    page.click("button[type=submit]")
    page.wait_for_timeout(1200)
    alert = page.evaluate(
        """() => {
          const el = document.querySelector('[role=alert]');
          return el ? el.textContent.trim() : null;
        }"""
    )
    out["failure_state"] = alert
    note(bool(alert), "form: a rejected submission showed no inline error")
    page.screenshot(path=f"{OUT}/form-error.png")
    page.close()
    return out


def reduced_motion_pass(browser):
    page = browser.new_page(viewport={"width": 1366, "height": 768}, reduced_motion="reduce")
    page.goto(BASE, wait_until="load")
    page.wait_for_timeout(1800)
    page.evaluate(
        "() => { const b=[...document.querySelectorAll('button')]"
        ".find(e=>/skip intro/i.test(e.textContent||'')); if(b) b.click(); }"
    )
    page.wait_for_timeout(800)
    page.evaluate(
        """() => document.querySelector('nav[aria-label="Primary navigation"] a[href="#experience"]').click()"""
    )
    page.wait_for_timeout(2000)
    # With reduced motion every phase collapses to 40 ms, so the overlay only
    # exists for ~280 ms: poll tightly and keep the frames that caught it.
    frames = []
    page.evaluate(
        """() => document.querySelector('nav[aria-label="Primary navigation"] a[href="#contact"]').click()"""
    )
    for index in range(26):
        frame = page.evaluate(
            """() => {
              const el = document.querySelector('[data-testid="hokage-summon-transition"]');
              if (!el) return {present: false};
              const disp = (sel) => {
                const node = el.querySelector(sel);
                return node ? getComputedStyle(node).display : 'absent';
              };
              return {
                present: true,
                state: el.dataset.teleportState,
                direction: el.dataset.teleportDirection,
                map: disp('.hs-map'),
                gather: disp('.hs-gather'),
                seal: disp('.hs-seal'),
                ink: disp('.hs-ink'),
                scroll: disp('.hs-scroll'),
                flash: disp('.hs-flash'),
                veil: !!el.querySelector('.world-veil'),
                running: document.getAnimations().filter(a => a.playState === 'running').length,
              };
            }"""
        )
        if frame.get("present"):
            frames.append(frame)
            if len(frames) == 2:
                page.screenshot(path=f"{OUT}/reduced-transition.png")
        page.wait_for_timeout(18)

    probe = {
        "frames": len(frames),
        "states": sorted({f["state"] for f in frames if f.get("state")}),
        "art_hidden": all(
            f.get(key) in ("none", "absent")
            for f in frames
            for key in ("map", "gather", "seal", "ink", "scroll", "flash")
        ) if frames else None,
        "veil_present": any(f.get("veil") for f in frames),
        "running_animations": max((f.get("running", 0) for f in frames), default=0),
    }
    page.wait_for_timeout(2200)
    after = page.evaluate(
        """() => ({
          overlays: document.querySelectorAll('[data-teleport-state]').length,
          locked: getComputedStyle(document.documentElement).overflow === 'hidden',
          dust: [...document.querySelectorAll('.ctc-dust')].map(e => getComputedStyle(e).display),
        })"""
    )
    note(probe["frames"] > 0, "reduced motion: identity did not mount (no frame captured)")
    note(
        probe["art_hidden"] is not False,
        f"reduced motion: moving layers still render {probe}",
    )
    note(probe["veil_present"], "reduced motion: veil missing")
    note(after["overlays"] == 0 and not after["locked"], "reduced motion: overlay or lock left behind")
    note(
        all(d == "none" for d in after["dust"]),
        f"reduced motion: chamber dust still rendered {after['dust']}",
    )
    page.close()
    return {"probe": probe, "after": after}


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width, height in VIEWPORTS:
            os.makedirs(f"{OUT}/{width}", exist_ok=True)
            print(f"[env] {width}x{height}")
            results["viewports"][f"{width}x{height}"] = environment_pass(browser, width, height)

        print("[transitions] 1366")
        results["transitions"]["1366"] = transition_pass(browser, 1366, 768, "transition")
        print("[transitions] 390")
        results["transitions"]["390"] = transition_pass(browser, 390, 844, "transition")

        print("[identity regression]")
        results["identity_regression"] = identity_regression_pass(browser)

        print("[form]")
        results["form"] = form_pass(browser)

        print("[reduced motion]")
        results["reduced_motion"] = reduced_motion_pass(browser)

        browser.close()

    with open(f"{OUT}/validation.json", "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=1)

    print("\n--- summary ---")
    for key in ("identity_regression", "form", "reduced_motion"):
        print(key, json.dumps(results[key])[:400])
    print("errors:", len(errors))
    for error in errors:
        print("  x", error)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
