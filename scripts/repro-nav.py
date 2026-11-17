import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3023"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(11000)
        async def st():
            return await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
        async def wait_idle():
            for _ in range(30):
                if await st()=="IDLE": return
                await page.wait_for_timeout(300)
            print("wait_idle timeout", await st(), flush=True)
        await page.evaluate("()=>document.querySelector('a[href=\"#about\"]').click()")
        await page.wait_for_timeout(800)
        print("nav about start", await st(), flush=True)
        await wait_idle()
        print("nav about done", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        await page.evaluate("()=>document.querySelector('a[href=\"#home\"]').click()")
        await page.wait_for_timeout(800)
        print("nav home start", await st(), flush=True)
        await wait_idle()
        print("nav home done", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        # rapid scroll test
        for i in range(8):
            await page.mouse.wheel(0,300); await page.wait_for_timeout(80)
        await page.wait_for_timeout(800)
        print("rapid", await st(), flush=True)
        await wait_idle()
        print("rapid done", await st(), flush=True)
        # navbar about again
        await page.evaluate("()=>document.querySelector('a[href=\"#about\"]').click()")
        await page.wait_for_timeout(800)
        print("second about", await st(), flush=True)
        await wait_idle()
        print("second done", await st(), flush=True)
        await browser.close()
asyncio.run(main())
