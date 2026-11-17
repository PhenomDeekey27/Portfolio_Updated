"""Phase 6.4 - filmstrip of the Flying Raijin transition.

`page.screenshot()` takes ~400-600 ms, which is longer than the 680 ms kunai
descent, so the old capture only ever photographed empty frames. This uses the
CDP screencast (async frame stream at ~30 fps) to record the real sequence and
writes a contact sheet plus zoomed crops of the weapon at true size.

Usage: python scripts/capture-transition-filmstrip.py [base_url] [width] [height]
Output: screenshots/phase64/kunai-filmstrip/
"""

import asyncio
import base64
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
WIDTH = int(sys.argv[2]) if len(sys.argv) > 2 else 1366
HEIGHT = int(sys.argv[3]) if len(sys.argv) > 3 else 768
OUT = "screenshots/phase64/kunai-filmstrip"


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=1
        )
        page = await context.new_page()
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1600)

        cdp = await context.new_cdp_session(page)
        frames = []

        def on_frame(params):
            frames.append(
                {
                    "ts": params["metadata"].get("timestamp", 0),
                    "data": params["data"],
                }
            )
            asyncio.ensure_future(cdp.send("Page.screencastFrameAck", {"sessionId": params["sessionId"]}))

        cdp.on("Page.screencastFrame", on_frame)
        await cdp.send(
            "Page.startScreencast",
            {
                "format": "png",
                "quality": 100,
                "maxWidth": WIDTH,
                "maxHeight": HEIGHT,
                "everyNthFrame": 1,
            },
        )

        triggered = False
        for _ in range(80):
            await page.mouse.wheel(0, 180)
            await page.wait_for_timeout(30)
            state = await page.evaluate(
                "() => document.querySelector('[data-teleport-state]')?.getAttribute('data-teleport-state') ?? null"
            )
            if state:
                triggered = True
                break
        await page.wait_for_timeout(1800)
        await cdp.send("Page.stopScreencast")

        print(f"triggered {triggered} frames {len(frames)}")
        if not frames:
            await browser.close()
            return

        paths = []
        for i, frame in enumerate(frames):
            path = os.path.join(OUT, f"f{i:03d}.png")
            with open(path, "wb") as fh:
                fh.write(base64.b64decode(frame["data"]))
            paths.append(path)

        # Contact sheet: every frame, 5 columns, labelled by index.
        thumbs = []
        for path in paths:
            with Image.open(path) as im:
                im = im.convert("RGB")
                im.thumbnail((300, 300), Image.LANCZOS)
                thumbs.append((os.path.basename(path), im.copy()))
        if thumbs:
            cols = 5
            rows = (len(thumbs) + cols - 1) // cols
            tw = max(t.width for _, t in thumbs)
            th = max(t.height for _, t in thumbs)
            sheet = Image.new("RGB", (cols * tw, rows * (th + 18)), (12, 10, 9))
            from PIL import ImageDraw

            draw = ImageDraw.Draw(sheet)
            for idx, (name, thumb) in enumerate(thumbs):
                x = (idx % cols) * tw
                y = (idx // cols) * (th + 18)
                sheet.paste(thumb, (x, y))
                draw.text((x + 4, y + th + 3), name, fill=(210, 190, 150))
            sheet.save(os.path.join(OUT, "contact-sheet.png"))

        # Zoom crops around the gun barrel area for the frames with most change.
        for i, path in enumerate(paths):
            if i % 3:
                continue
            with Image.open(path) as im:
                w, h = im.size
                box = min(360, w, h)
                cx, cy = w // 2, int(h * 0.47)
                left = max(0, cx - box // 2)
                top = max(0, cy - box // 2)
                crop = im.crop((left, top, left + box, top + box))
                crop.resize((box * 3, box * 3), Image.LANCZOS).save(
                    os.path.join(OUT, f"zoom-{i:03d}.png")
                )

        await browser.close()


asyncio.run(main())
