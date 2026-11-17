import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3002"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(6500)
        await page.screenshot(path="screenshots/A-home.png")
        print("A done")
        for i in range(5):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(200)
            st=await page.evaluate("() => document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state') || 'none'")
            print(f"wheel {i} state={st}")
        for t in [200,400,600,900,1300,1800,2500]:
            await page.wait_for_timeout(300 if t==200 else 300)
            st=await page.evaluate("() => document.querySelector('[data-testid=\"kunai-transition\"]')?.outerHTML?.slice(0,300) || 'missing'")
            print(f"t={t} html={st[:200]}")
            await page.screenshot(path=f"screenshots/debug-{t}.png")
        await browser.close()
asyncio.run(main())
