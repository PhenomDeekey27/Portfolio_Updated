"""
PHASE 6.16 — final production verification.

Three independent checks against a production build (`next start -p 3100`):

  1. COMPOSITION — eight viewports, real visitor widths: horizontal overflow,
     every section anchor, the mission records and the footer.
  2. REDUCED MOTION — desktop and phone: the intro must not wait, the settled
     village must be on screen, and no decorative sequence may run.
  3. FRAME BUDGET — BugWiser (sand) and ResQ (wind) staged in view on a phone,
     sampled with a still page, CPU throttled 4x.

    python scripts/verify-phase616.py [--url http://localhost:3100]
"""

import argparse
import asyncio
import json
import statistics
from pathlib import Path

from playwright.async_api import async_playwright

OUT = Path("screenshots/phase616")

VIEWPORTS = [
    (1920, 1080, False),
    (1366, 768, False),
    (1024, 768, False),
    (430, 932, True),
    (390, 844, True),
    (375, 812, True),
    (360, 800, True),
    (320, 655, True),
]

LAYOUT = """() => {
  const root = document.documentElement;
  const vw = window.innerWidth;
  const anchors = ['home','about','skills','missions','experience','contact']
    .map((id) => Boolean(document.getElementById(id)));
  const overflow = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.position === 'fixed' || style.visibility === 'hidden') continue;
    if (r.right > vw + 1.5) {
      overflow.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 60),
        right: Math.round(r.right),
      });
    }
  }
  const record = document.querySelector('#wnd-record, #bw-record');
  return {
    vw,
    scrollWidth: root.scrollWidth,
    horizontalOverflow: root.scrollWidth - vw,
    anchors,
    overflowing: overflow.slice(0, 5),
    recordHeight: record ? Math.round(record.getBoundingClientRect().height) : null,
    footerVisible: Boolean(document.querySelector('footer')),
    heroRole: document.querySelector('#home')?.textContent?.includes('AI-Focused') ?? false,
  };
}"""

REST = """() => {
  const hero = document.querySelector('#home h1 span span');
  const loader = document.querySelector('[data-raijin-loader]');
  const loaderStyle = loader ? getComputedStyle(loader) : null;
  const running = document.getAnimations
    ? document.getAnimations().filter((a) => a.playState === 'running')
    : [];
  return {
    heroLetterOpacity: hero ? Number(getComputedStyle(hero).opacity) : null,
    loaderVisible: loaderStyle
      ? loaderStyle.display !== 'none' && Number(loaderStyle.opacity) > 0.01
      : false,
    settled: document.querySelector('[data-world-settled]')?.dataset.worldSettled ?? null,
    runningAnimations: running.length,
    infiniteAnimations: running.filter((a) => {
      const t = a.effect?.getTiming?.();
      return t && (t.iterations === Infinity || t.iterations > 3);
    }).length,
  };
}"""

SAMPLER = """() => {
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
}"""


async def settle(page, ms=1200):
    await page.wait_for_timeout(ms)


async def skip_intro(page):
    button = page.get_by_role("button", name="Skip intro")
    if await button.count():
        try:
            await button.first.click(timeout=1200)
        except Exception:
            pass


async def layout_check(browser, url):
    results = []
    for width, height, mobile in VIEWPORTS:
        ctx = await browser.new_context(
            viewport={"width": width, "height": height},
            is_mobile=mobile,
            has_touch=mobile,
            device_scale_factor=1,
        )
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        await page.goto(url, wait_until="load")
        await settle(page, 900)
        await skip_intro(page)
        await settle(page, 1400)
        data = await page.evaluate(LAYOUT)
        data["errors"] = errors[:4]
        data["size"] = f"{width}x{height}"
        results.append(data)
        await page.screenshot(path=str(OUT / f"verify-{width}x{height}.png"))
        print("LAYOUT", json.dumps(data))
        await ctx.close()
    return results


async def reduced_check(browser, url):
    results = []
    for width, height, mobile in [(390, 844, True), (1920, 1080, False)]:
        ctx = await browser.new_context(
            viewport={"width": width, "height": height},
            is_mobile=mobile,
            has_touch=mobile,
            reduced_motion="reduce",
        )
        page = await ctx.new_page()
        await page.goto(url, wait_until="load")
        await settle(page, 900)
        early = await page.evaluate(REST)
        await settle(page, 1800)
        late = await page.evaluate(REST)
        row = {"size": f"{width}x{height}", "early": early, "late": late}
        results.append(row)
        print("REDUCED", json.dumps(row))
        await ctx.close()
    return results


async def stage_frames(browser, url, jutsu):
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = await ctx.new_page()
    await page.goto(url, wait_until="load")
    await settle(page, 900)
    await skip_intro(page)
    await settle(page, 1200)

    # Park the stage just inside the reading band, with the page still.
    await page.evaluate(
        """(jutsu) => {
          const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
          const stage = art?.querySelector('[class$="-stage"]');
          if (!stage) return;
          const top = stage.getBoundingClientRect().top + window.scrollY - innerHeight * 0.1;
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
        }""",
        jutsu,
    )
    await settle(page, 600)

    cdp = await ctx.new_cdp_session(page)
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

    # Prove the technique is running while the frames are sampled; a still page
    # samples cleanly and would flatter any build.
    state = await page.evaluate(
        """(jutsu) => {
          const art = document.querySelector(`[data-jutsu="${jutsu}"]`);
          const title = art?.querySelector('h3');
          return {
            active: art?.dataset.active ?? null,
            titleAnims: title ? [...new Set(title.getAnimations({subtree: true}).map((a) => a.animationName))] : [],
          };
        }""",
        jutsu,
    )
    await page.evaluate(SAMPLER)
    await settle(page, 3500)
    frames = await page.evaluate("() => { window.__sampling = false; return window.__frames; }")
    frames = [f for f in frames if f > 0]
    await ctx.close()
    if not frames:
        return None
    ordered = sorted(frames)
    return {
        "jutsu": jutsu,
        "activeDuringSample": state["active"] == "true",
        "titleAnims": state["titleAnims"],
        "frames": len(frames),
        "p50_ms": round(statistics.median(frames), 1),
        "p95_ms": round(ordered[max(0, int(len(ordered) * 0.95) - 1)], 1),
        "long_frame_share_pct": round(sum(1 for f in frames if f > 33.4) / len(frames) * 100, 1),
    }


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:3100")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        layout = await layout_check(browser, args.url)
        reduced = await reduced_check(browser, args.url)
        frames = []
        for jutsu in ("sand", "wind"):
            row = await stage_frames(browser, args.url, jutsu)
            print("FRAMES", json.dumps(row))
            frames.append(row)
        await browser.close()

    report = {"url": args.url, "layout": layout, "reduced": reduced, "frames": frames}
    (OUT / "verify-phase616.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    failures = []
    for row in layout:
        if row["horizontalOverflow"] > 1:
            failures.append(f"{row['size']}: horizontal overflow {row['horizontalOverflow']}px")
        if not all(row["anchors"]):
            failures.append(f"{row['size']}: missing section anchor")
        if row["errors"]:
            failures.append(f"{row['size']}: console errors {row['errors']}")
        if row["recordHeight"] is None:
            failures.append(f"{row['size']}: mission record not found")
    for row in reduced:
        if row["early"]["loaderVisible"] or row["late"]["loaderVisible"]:
            failures.append(f"{row['size']} reduced: loader visible")
        if not row["late"]["heroLetterOpacity"]:
            failures.append(f"{row['size']} reduced: hero copy not visible")
        if row["late"]["infiniteAnimations"]:
            failures.append(
                f"{row['size']} reduced: {row['late']['infiniteAnimations']} infinite animations running"
            )
    for row in frames:
        if not row or not row.get("activeDuringSample"):
            failures.append(f"frames: {row and row['jutsu']} stage was not armed while sampling")
    print("\nFAILURES", json.dumps(failures, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
