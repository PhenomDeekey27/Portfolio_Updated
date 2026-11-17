"""Rasterise an authored SVG scene to a background raster for the site.

The Experience archive chamber is hand-authored vector artwork (this repo has no
image-generation capability, and earlier phases used the same approach for the
Missions room). Browsers rasterise the SVG at display size; shipping a WebP of
the same art keeps the background decode small and avoids re-rasterising a
filter-heavy SVG on every resize.

Usage:
    python scripts/render-scene.py <svg> <out.png> <width> <height> [webp_quality]

Example:
    python scripts/render-scene.py \
        public/assets/experience/career-archive-chamber.svg \
        public/assets/experience/career-archive-chamber.webp 2560 1440 86
"""

import asyncio
import os
import sys
import tempfile

from PIL import Image
from playwright.async_api import async_playwright

SVG = sys.argv[1]
OUT = sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 2560
H = int(sys.argv[4]) if len(sys.argv) > 4 else 1440
QUALITY = int(sys.argv[5]) if len(sys.argv) > 5 else 86

HTML = f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body {{ margin: 0; padding: 0; background: #070806; }}
  img {{ display: block; width: {W}px; height: {H}px; }}
</style></head>
<body><img id="scene" src="file:///{os.path.abspath(SVG).replace(os.sep, '/')}"></body>
</html>"""


async def main():
    with tempfile.NamedTemporaryFile(
        "w", suffix=".html", delete=False, encoding="utf-8"
    ) as fh:
        fh.write(HTML)
        html_path = fh.name

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": W, "height": H}, device_scale_factor=1
        )
        await page.goto("file:///" + html_path.replace(os.sep, "/"))
        await page.wait_for_timeout(1200)
        tmp_png = OUT + ".render.png"
        await page.screenshot(path=tmp_png, clip={"x": 0, "y": 0, "width": W, "height": H})
        await browser.close()

    os.unlink(html_path)

    ext = os.path.splitext(OUT)[1].lower()
    if ext == ".webp":
        with Image.open(tmp_png) as im:
            im.save(OUT, "WEBP", quality=QUALITY, method=6)
        os.unlink(tmp_png)
    else:
        os.replace(tmp_png, OUT)

    size = os.path.getsize(OUT)
    with Image.open(OUT) as im:
        print(f"{OUT}: {im.size[0]}x{im.size[1]} {im.format} {size/1024:.0f} KB")


asyncio.run(main())
