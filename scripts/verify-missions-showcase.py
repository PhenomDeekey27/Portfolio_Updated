"""Verify the Jutsu Encounter Archive.

Checks, per viewport:
  * four encounters in sequence with the expected treatments
  * every encounter has an accessible heading, alt text and links
  * the Field Archive holds exactly four records and none is E-Invite
  * no horizontal overflow
  * no hover-only information (info lives in plain DOM)
  * reduced motion: content visible, no running animations, stages composed

Also reports the luminance spread of a record's text region (background median
vs. text bright pixels) as a readability signal.

Usage: BASE=http://localhost:3001 python scripts/verify-missions-showcase.py
"""

import asyncio
import io
import json
import os

from PIL import Image, ImageStat
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
OUT = "screenshots/phase65/verify"
VIEWPORTS = [(1920, 1080), (1366, 768), (390, 844), (375, 812), (430, 932)]

STRUCTURE_JS = """() => {
  const encounters = [...document.querySelectorAll('[data-encounter]')];
  const archiveGrid = document.querySelector('#missions h3')?.closest('div')?.parentElement;
  const archiveLinks = [...document.querySelectorAll('#missions a[href]')];
  return {
    encounterIds: encounters.map((el) => el.dataset.encounter),
    treatments: encounters.map((el) => el.dataset.jutsu),
    headings: encounters.map((el) => el.querySelector('h3')?.textContent.trim()),
    ranks: encounters.map((el) => el.querySelector('[aria-label^="Mission rank"]')?.getAttribute('aria-label')),
    images: encounters.map((el) => {
      const img = el.querySelector('img');
      const svg = el.querySelector('[role="img"]');
      return img ? img.getAttribute('alt') : svg ? svg.getAttribute('aria-label') : null;
    }),
    links: archiveLinks.map((a) => ({
      href: a.getAttribute('href'),
      label: a.getAttribute('aria-label'),
      text: a.textContent.trim().slice(0, 40),
    })),
    bodyText: document.querySelector('#missions').innerText,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    encounterCount: encounters.length,
  };
}"""

ANIM_JS = """() => {
  const seconds = (value) => {
    const parts = value.split(',').map((v) => v.trim());
    return Math.max(...parts.map((v) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v))));
  };
  const all = [];
  const real = [];
  for (const el of document.querySelectorAll('#missions *')) {
    const cs = getComputedStyle(el);
    if (cs.animationName === 'none') continue;
    const dur = seconds(cs.animationDuration);
    const entry = { name: cs.animationName, duration: cs.animationDuration, delay: cs.animationDelay };
    all.push(entry);
    // A collapsed animation (0.001ms) is not "running" in any visible sense.
    if (dur > 0.01) real.push(entry);
  }
  const title = document.querySelector('[data-encounter="resq"] h3 span');
  return {
    declared: all.length,
    running: real,
    titleOpacity: title ? getComputedStyle(title).opacity : null,
    expandedLeaves: getComputedStyle(document.querySelector('.enc-leaf-l')).display,
  };
}"""

ACTIVE_ONCE_JS = """async () => {
  const el = document.querySelector('[data-encounter="resq"]');
  const before = el.dataset.active;
  const top = el.getBoundingClientRect().top + window.scrollY;
  // Scroll well past the encounter, then back onto it.
  window.scrollTo({ top: top + window.innerHeight * 2, behavior: 'instant' });
  await new Promise((r) => setTimeout(r, 500));
  const away = el.dataset.active;
  window.scrollTo({ top: top - 80, behavior: 'instant' });
  await new Promise((r) => setTimeout(r, 500));
  return { before, away, back: el.dataset.active };
}"""


def luminance(png):
    im = Image.open(io.BytesIO(png)).convert("L")
    px = sorted(im.getdata())
    n = len(px)
    return {
        "p10": px[int(n * 0.1)],
        "p50": px[int(n * 0.5)],
        "p90": px[int(n * 0.9)],
        "mean": round(sum(px) / n, 1),
    }


async def boot(p, w, h, reduced=False):
    browser = await p.chromium.launch()
    page = await browser.new_page(
        viewport={"width": w, "height": h}, reduced_motion="reduce" if reduced else "no-preference"
    )
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(1100)
    skip = page.get_by_role("button", name="Skip intro")
    if await skip.count():
        try:
            await skip.first.click(timeout=2000)
        except Exception:
            pass
    await page.wait_for_timeout(700)
    return browser, page


async def main():
    os.makedirs(OUT, exist_ok=True)
    results = []
    async with async_playwright() as p:
        for w, h in VIEWPORTS:
            browser, page = await boot(p, w, h)
            await page.evaluate(
                """() => {
                  const el = document.querySelector('[data-encounter="resq"]');
                  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
                }"""
            )
            await page.wait_for_timeout(2000)
            data = await page.evaluate(STRUCTURE_JS)
            data["viewport"] = [w, h]
            data["viewportsize"] = f"{w}x{h}"

            # Luminance spread of the record column (text over ink pool).
            body = page.locator('[data-encounter="resq"] .enc-body').first
            shot = await body.screenshot()
            data["recordLuminance"] = luminance(shot)

            if (w, h) == (1366, 768):
                await page.screenshot(path=f"{OUT}/1366-resq-record.png")
            if (w, h) == (390, 844):
                await page.screenshot(path=f"{OUT}/390-resq-record.png")
            await browser.close()

            # Reduced motion pass
            browser, page = await boot(p, w, h, reduced=True)
            await page.evaluate(
                """() => {
                  const el = document.querySelector('[data-encounter="resq"]');
                  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
                }"""
            )
            await page.wait_for_timeout(1200)
            anim = await page.evaluate(ANIM_JS)
            data["reducedMotion"] = anim
            data["activeStability"] = await page.evaluate(ACTIVE_ONCE_JS)
            if (w, h) in ((1366, 768), (390, 844)):
                await page.screenshot(path=f"{OUT}/{w}-reduced-motion.png")
            await browser.close()

            results.append(data)

    with open(f"{OUT}/report.json", "w") as fh:
        json.dump(results, fh, indent=1)

    for r in results:
        print(f"== {r['viewportsize']} ==")
        print("  encounters:", r["encounterIds"], r["treatments"])
        print("  headings :", r["headings"])
        print("  ranks    :", r["ranks"])
        print("  alts     :", r["images"])
        print("  archive  :", len(r["links"]), [l["label"] or l["text"] for l in r["links"]])
        print("  e-invite in text:", "e-invite" in r["bodyText"].lower())
        print("  overflowX:", r["overflowX"])
        print("  record luminance:", r["recordLuminance"])
        print(
            "  reduced: declared animations =",
            r["reducedMotion"]["declared"],
            "| running (>", "0.01s) =",
            len(r["reducedMotion"]["running"]),
            "| title opacity =",
            r["reducedMotion"]["titleOpacity"],
            "| leaf display =",
            r["reducedMotion"]["expandedLeaves"],
        )
        print("  active stability:", r["activeStability"])


asyncio.run(main())
