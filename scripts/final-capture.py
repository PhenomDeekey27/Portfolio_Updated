import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3004"
async def cap(page, path):
    await page.screenshot(path=path, animations="allow", timeout=30000)
    print(f"captured {path}", flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(11000)
        await cap(page, "screenshots/FINAL-home.png")
        # Home -> About via scroll
        for i in range(5):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(180)
        await page.wait_for_timeout(5000)
        await cap(page, "screenshots/FINAL-about.png")
        # poll state
        st=await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
        print(f"state after = {st}", flush=True)
        # About scrolled middle
        await page.evaluate("()=>{ const el=document.querySelector('[data-about-section]'); el.scrollIntoView(); window.scrollBy(0,600); }")
        await page.wait_for_timeout(1500)
        await cap(page, "screenshots/FINAL-about-lower.png")
        # Reverse
        await page.evaluate("()=>window.scrollTo(0,0)")
        await page.wait_for_timeout(5000)
        await cap(page, "screenshots/FINAL-home-back.png")
        # Tablet
        tpage=await browser.new_page(viewport={"width":768,"height":1024})
        await tpage.goto(BASE, wait_until="domcontentloaded")
        await tpage.wait_for_timeout(11000)
        await tpage.screenshot(path="screenshots/FINAL-tablet-home.png", animations="allow", timeout=30000)
        print("tablet home done", flush=True)
        # Mobile
        mpage=await browser.new_page(viewport={"width":390,"height":844})
        await mpage.goto(BASE, wait_until="domcontentloaded")
        await mpage.wait_for_timeout(11000)
        await mpage.screenshot(path="screenshots/FINAL-mobile-home.png", animations="allow", timeout=30000)
        print("mobile home done", flush=True)
        await browser.close()
        print("ALL DONE", flush=True)
asyncio.run(main())
