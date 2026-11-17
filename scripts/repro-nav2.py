import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3014"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(11000)
        async def st():
            return await page.evaluate("()=>({s:document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE', y:window.scrollY, a:window.__activeRef?.()})")
        print("init", await st(), flush=True)
        await page.get_by_role("link", name="About").first.click(timeout=5000)
        for k in range(12):
            await page.wait_for_timeout(400)
            print(f"t{k}", await st(), flush=True)
        await browser.close()
asyncio.run(main())
