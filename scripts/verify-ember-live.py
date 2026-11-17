"""Phase 6.2 — live ember verification via real wheel scrolling."""

import asyncio, os
from PIL import Image
from playwright.async_api import async_playwright

BASE = "http://localhost:3001"
OUT = "screenshots/phase62/live"

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1920, "height": 1080})
        pg = await ctx.new_page()
        await pg.goto(BASE, wait_until="domcontentloaded")
        await pg.wait_for_timeout(1000)
        s = pg.get_by_role("button", name="Skip intro")
        if await s.count():
            try: await s.first.click(timeout=2000)
            except Exception: pass
        await pg.wait_for_timeout(1400)

        for _ in range(60):
            await pg.mouse.wheel(0, 180)
            await pg.wait_for_timeout(35)
        await pg.wait_for_timeout(3000)
        print("phase:", await pg.evaluate("() => document.querySelector('[data-section-content=\"experience\"]').dataset.revealPhase"))
        print("active:", await pg.evaluate("() => [...document.querySelectorAll('#experience li[data-chapter-index]')].findIndex(l=>l.dataset.active==='true')"))

        for step in range(4):
            for _ in range(6):
                await pg.mouse.wheel(0, 180)
                await pg.wait_for_timeout(40)
            await pg.wait_for_timeout(2200)
            active = await pg.evaluate("() => [...document.querySelectorAll('#experience li[data-chapter-index]')].findIndex(l=>l.dataset.active==='true')")
            phase = await pg.evaluate("() => document.querySelector('[data-section-content=\"experience\"]').dataset.revealPhase")
            print(f"step {step}: active={active} phase={phase}")
            await pg.screenshot(path=f"{OUT}/step{step}-natural.png")
            await pg.add_style_tag(content=".exp-ember{animation:none !important;opacity:1 !important;background-position:48% 0 !important;}")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"{OUT}/step{step}-frozen.png")
            await pg.add_style_tag(content=".exp-ember{animation:exp-ember-sweep 1350ms cubic-bezier(0.35,0,0.25,1) 220ms 1 both !important;}")
            await pg.wait_for_timeout(200)
            Image.open(f"{OUT}/step{step}-natural.png").convert("RGB").save(f"{OUT}/step{step}-natural.jpg", quality=94)
            Image.open(f"{OUT}/step{step}-frozen.png").convert("RGB").save(f"{OUT}/step{step}-frozen.jpg", quality=94)

        await ctx.close(); await b.close()

asyncio.run(main())
