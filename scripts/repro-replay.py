import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3022"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(10000)
        async def st():
            return await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
        print("start", await st(), flush=True)
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(700)
        print("after scroll1", await st(), flush=True)
        await page.wait_for_timeout(4000)
        print("after wait1", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        # back home
        await page.evaluate("()=>window.scrollTo(0,0)")
        await page.wait_for_timeout(700)
        print("after back", await st(), flush=True)
        await page.wait_for_timeout(4000)
        print("after wait back", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        # re-enter about
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(700)
        print("after re-enter scroll", await st(), flush=True)
        await page.wait_for_timeout(4000)
        print("after re-enter wait", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        # navbar home then about
        try:
            await page.get_by_role("link", name="Home").first.click(timeout=5000)
            await page.wait_for_timeout(1000)
            print("nav home", await st(), flush=True)
            await page.wait_for_timeout(4000)
            print("nav home done", await st(), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
            await page.get_by_role("link", name="About").first.click(timeout=5000)
            await page.wait_for_timeout(1000)
            print("nav about", await st(), flush=True)
        except Exception as e:
            print(f"nav err {e}", flush=True)
        await browser.close()
asyncio.run(main())
