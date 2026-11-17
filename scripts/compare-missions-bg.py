"""Phase 6.4 — Missions cinematic background comparison harness (v1 / v2 / v3).

Captures the real Missions archive at each viewport with the *actual* sticky
world layer, `bg-cover`, responsive `background-position` and the production
scrim stack. Each supplied variant is applied only inside the capture session by
overriding the inline `background-image` of that same layer, so nothing is
activated for users and no application code changes.

Variants (all preserved on disk):
    v1  /assets/missions/mission-hq-cinematic.png
    v2  /assets/missions/mission-hq-cinematic-v2.png
    v3  /assets/missions/mission-hq-cinematic-v3.png

For each viewport/variant we capture:
    top / mid / end      real content
    plate                content hidden, for luminance + WCAG contrast
    plate-pos-*          responsive background-position sweep (mobile crop)

Usage:
    python scripts/compare-missions-bg.py [base_url]

Requires a running dev server (default http://localhost:3001).

Output:
    screenshots/phase64/missions/<viewport>/<variant>-*.png
    screenshots/phase64/missions/report.json
"""

import asyncio
import hashlib
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "BASE", "http://localhost:3001"
)

VARIANTS = [
    ("v1", "/assets/missions/mission-hq-cinematic.png"),
    ("v2", "/assets/missions/mission-hq-cinematic-v2.png"),
    ("v3", "/assets/missions/mission-hq-cinematic-v3.png"),
]
OUT = os.environ.get("CMP_OUT", "screenshots/phase64/missions")

VIEWPORTS = [
    ("1920x1080", 1920, 1080),
    ("1366x768", 1366, 768),
    ("390x844", 390, 844),
]

# Sensible responsive positions per viewport. First entry is the current
# production `background-position` for that width class.
POSITION_SWEEPS = {
    "1920x1080": ["50% 50%"],
    "1366x768": ["50% 50%"],
    "390x844": ["74% 50%", "70% 50%", "78% 50%", "82% 50%", "86% 50%"],
}

# Text column of the Missions content, as a fraction of the plate. Used to
# measure how bright the background is exactly where dossier titles sit.
BANDS = {
    "1920x1080": (0.03, 0.42, 0.10, 0.82),
    "1366x768": (0.04, 0.46, 0.10, 0.82),
    "390x844": (0.03, 0.97, 0.16, 0.80),
}

STATE_JS = """() => {
  const section = document.getElementById('missions');
  const world = document.querySelector('[data-missions-world]');
  const layer = world ? world.querySelector('div[style*="background-image"]') : null;
  return {
    y: Math.round(window.scrollY),
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    backgroundImage: layer ? getComputedStyle(layer).backgroundImage : null,
    backgroundSize: layer ? getComputedStyle(layer).backgroundSize : null,
    backgroundPosition: layer ? getComputedStyle(layer).backgroundPosition : null,
    dossiers: section.querySelectorAll('article').length,
    archiveEntries: section.querySelectorAll('a[href^="http"]').length,
    phase: document.querySelector('[data-section-content="missions"]')
      ?.getAttribute('data-reveal-phase'),
  };
}"""

LAYOUT_JS = """() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left), y: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      xPct: Math.round((r.left / innerWidth) * 100),
      wPct: Math.round((r.width / innerWidth) * 100),
    };
  };
  const content = document.querySelector('[data-section-content="missions"]');
  const heading = content ? content.querySelector('h2') : null;
  const intro = content
    ? [...content.querySelectorAll('p')].find((p) => p.textContent.includes('Open-source tools'))
    : null;
  const featured = content ? content.querySelector('article') : null;
  return {
    contentColumn: box(content),
    heading: box(heading),
    intro: box(intro),
    featuredDossier: box(featured),
  };
}"""

DECODE_JS = """(src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = src;
})"""

APPLY_JS = """(src) => {
  const layer = document.querySelector('[data-missions-world] div[style*="background-image"]');
  if (!layer) return false;
  layer.style.backgroundImage = `url("${src}")`;
  return true;
}"""

SET_POS_JS = """(pos) => {
  const layer = document.querySelector('[data-missions-world] div[style*="background-image"]');
  if (!layer) return false;
  layer.style.backgroundPosition = pos;
  return true;
}"""


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_info(path):
    if not os.path.exists(path):
        return {"present": False, "path": path.replace(os.sep, "/")}
    info = {
        "present": True,
        "path": path.replace(os.sep, "/"),
        "bytes": os.path.getsize(path),
        "kilobytes": round(os.path.getsize(path) / 1024),
        "megabytes": round(os.path.getsize(path) / 1024 / 1024, 2),
        "sha256": sha256(path),
    }
    try:
        with Image.open(path) as im:
            info["width"], info["height"] = im.size
            info["format"] = im.format
            info["mode"] = im.mode
            info["aspect"] = round(im.size[0] / im.size[1], 4)
            info["megapixels"] = round(im.size[0] * im.size[1] / 1_000_000, 2)
    except Exception as exc:
        info["error"] = f"{type(exc).__name__}: {exc}"
    return info


def _linear(channel):
    c = channel / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb):
    r, g, b = (_linear(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


TEXT_COLORS = {"heading": (0xED, 0xE7, 0xDA), "intro": (0xA3, 0x9D, 0x91)}


def contrast_ratio(light, dark):
    hi, lo = max(light, dark), min(light, dark)
    return round((hi + 0.05) / (lo + 0.05), 2)


def text_contrast(png_path, boxes):
    out = {}
    with Image.open(png_path) as im:
        rgb = im.convert("RGB")
        for label, color in TEXT_COLORS.items():
            box = boxes.get(label)
            if not box or box["w"] <= 0:
                continue
            x, y, w, h = box["x"], box["y"], box["w"], box["h"]
            crop = rgb.crop((x, y, x + w, y + h))
            lums = sorted(relative_luminance(p) for p in crop.getdata())
            n = len(lums)
            text_lum = relative_luminance(color)
            out[label] = {
                "mean": contrast_ratio(text_lum, sum(lums) / n),
                "p95": contrast_ratio(text_lum, lums[min(n - 1, int(n * 0.95))]),
            }
    return out


def band_luminance(png_path, band):
    x0, x1, y0, y1 = band
    with Image.open(png_path) as im:
        gray = im.convert("L")
        w, h = gray.size
        box = (int(w * x0), int(h * y0), int(w * x1), int(h * y1))
        region = gray.crop(box)
        hist = region.histogram()
    total = sum(hist)
    mean = sum(i * n for i, n in enumerate(hist)) / total
    cumulative = 0
    p95 = 255
    for i, n in enumerate(hist):
        cumulative += n
        if cumulative >= total * 0.95:
            p95 = i
            break
    variance = sum(n * (i - mean) ** 2 for i, n in enumerate(hist)) / total
    return {
        "region": [round(box[0]), round(box[1]), round(box[2]), round(box[3])],
        "meanLuma": round(mean, 1),
        "p95Luma": p95,
        "stdLuma": round(variance**0.5, 1),
    }


async def main():
    os.makedirs(OUT, exist_ok=True)
    report = {
        "phase": "6.4",
        "base": BASE,
        "variants": {
            name: image_info(os.path.join("public", path.lstrip("/").replace("/", os.sep)))
            for name, path in VARIANTS
        },
        "captures": [],
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def open_page(width, height):
            context = await browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion="no-preference",
            )
            page = await context.new_page()
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(1000)
            skip = page.get_by_role("button", name="Skip intro")
            if await skip.count():
                try:
                    await skip.first.click(timeout=2000)
                except Exception:
                    pass
            await page.wait_for_timeout(1400)
            return context, page

        async def scroll_to(page, y):
            await page.evaluate(
                "(y) => window.scrollTo({ top: y, behavior: 'instant' })", y
            )
            await page.wait_for_timeout(900)

        for label, width, height in VIEWPORTS:
            out_dir = os.path.join(OUT, label)
            os.makedirs(out_dir, exist_ok=True)
            context, page = await open_page(width, height)

            top = await page.evaluate(
                "() => document.getElementById('missions').getBoundingClientRect().top + window.scrollY"
            )
            section_h = await page.evaluate(
                "() => document.getElementById('missions').getBoundingClientRect().height"
            )

            entry = {
                "viewport": label,
                "size": [width, height],
                "sectionHeight": round(section_h),
                "activeOnLoad": await page.evaluate(STATE_JS),
                "variants": {},
            }

            for name, path in VARIANTS:
                info = report["variants"][name]
                if not info.get("present"):
                    continue

                applied = await page.evaluate(APPLY_JS, path)
                decoded = await page.evaluate(DECODE_JS, path)
                await page.evaluate(SET_POS_JS, POSITION_SWEEPS[label][0])
                await page.wait_for_timeout(500)

                vrec = {
                    "path": path,
                    "applied": bool(applied),
                    "decoded": bool(decoded),
                    "shots": [],
                    "plates": [],
                    "positionSweep": [],
                }

                for shot_name, fraction in [("top", 0.0), ("mid", 0.42), ("end", 0.92)]:
                    await scroll_to(page, round(top + (section_h - height) * fraction))
                    state = await page.evaluate(STATE_JS)
                    shot_path = os.path.join(out_dir, f"{name}-{shot_name}.png")
                    await page.screenshot(path=shot_path)
                    vrec["shots"].append({"name": shot_name, **state})

                # Background plate with content hidden.
                await scroll_to(page, round(top))
                await page.evaluate(
                    "() => { const c = document.querySelector('[data-section-content=\"missions\"]');"
                    " if (c) c.style.visibility = 'hidden'; }"
                )
                await page.wait_for_timeout(300)
                layout = await page.evaluate(LAYOUT_JS)
                if name == VARIANTS[0][0]:
                    entry["layout"] = layout
                boxes = {
                    "heading": layout.get("heading"),
                    "intro": layout.get("intro"),
                }

                for pos in POSITION_SWEEPS[label]:
                    await page.evaluate(SET_POS_JS, pos)
                    await page.wait_for_timeout(350)
                    state = await page.evaluate(STATE_JS)
                    tag = pos.split()[0].replace("%", "")
                    plate_path = os.path.join(out_dir, f"{name}-plate-pos-{tag}.png")
                    await page.screenshot(path=plate_path)
                    plate = {
                        "name": "plate",
                        "position": pos,
                        **state,
                        "readability": band_luminance(plate_path, BANDS[label]),
                        "textContrast": text_contrast(plate_path, boxes),
                    }
                    vrec["plates"].append(plate)
                    if pos != POSITION_SWEEPS[label][0]:
                        vrec["positionSweep"].append(plate)

                # Restore content + production position for the next variant.
                await page.evaluate(
                    "() => { const c = document.querySelector('[data-section-content=\"missions\"]');"
                    " if (c) c.style.visibility = 'visible'; }"
                )
                await page.evaluate(SET_POS_JS, POSITION_SWEEPS[label][0])
                await page.wait_for_timeout(250)

                entry["variants"][name] = vrec

            await context.close()
            report["captures"].append(entry)

        await browser.close()

    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)

    summary = {
        "variants": report["variants"],
        "captures": [
            {
                "viewport": c["viewport"],
                "activeOnLoad": {
                    "backgroundImage": c["activeOnLoad"]["backgroundImage"],
                    "backgroundPosition": c["activeOnLoad"]["backgroundPosition"],
                },
                "overflowX": {
                    name: [s["overflowX"] for s in v["shots"]]
                    for name, v in c["variants"].items()
                },
                "plates": {
                    name: v["plates"][0]
                    for name, v in c["variants"].items()
                    if v["plates"]
                },
                "positionSweep": {
                    name: v["positionSweep"]
                    for name, v in c["variants"].items()
                    if v["positionSweep"]
                },
            }
            for c in report["captures"]
        ],
    }
    print(json.dumps(summary, indent=2))


asyncio.run(main())
