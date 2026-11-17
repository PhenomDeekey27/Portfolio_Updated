import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3020"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        for w,h,name in [(1920,1080,"FINAL3-1920"),(1366,768,"FINAL3-1366"),(768,1024,"FINAL3-768"),(390,844,"FINAL3-390")]:
            page=await browser.new_page(viewport={"width":w,"height":h})
            await page.goto(BASE, wait_until="domcontentloaded")
            await page.wait_for_timeout(10500)
            for i in range(5):
                await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
            await page.wait_for_timeout(5500)
            await page.screenshot(path=f"screenshots/{name}.png", timeout=30000, animations="disabled")
            st = await page.evaluate("()=>({s:document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE', y:window.scrollY})")
            print(name, st, flush=True)
            await page.close()
        # replay check on 1366
        page=await browser.new_page(viewport={"width":1366,"height":768})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(10500)
        async def st():
            return await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
        await page.get_by_role("link", name="About").first.click(timeout=5000)
        await page.wait_for_timeout(800); print("nav about", await st(), flush=True)
        for _ in range(20):
            if await st()=="IDLE": break
            await page.wait_for_timeout(300)
        print("nav about idle", await st(), "y", await page.evaluate("()=>window.scrollY"), flush=True)
        await page.get_by_role("link", name="Home").first.click(timeout=5000)
        await page.wait_for_timeout(800); print("nav home", await st(), flush=True)
        for _ in range(20):
            if await st()=="IDLE": break
            await page.wait_for_timeout(300)
        print("nav home idle", await st(), "y", await page.evaluate("()=>window.scrollY"), flush=True)
        await page.mouse.wheel(0,250); await page.mouse.wheel(0,250)
        await page.wait_for_timeout(800); print("scroll re-enter", await st(), flush=True)
        for _ in range(20):
            if await st()=="IDLE": break
            await page.wait_for_timeout(300)
        print("scroll re-enter idle", await st(), flush=True)
        await browser.close()
asyncio.run(main())
