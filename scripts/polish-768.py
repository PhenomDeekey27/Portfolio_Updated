import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3006"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":768,"height":1024})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(10000)
        for i in range(5):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(160)
        await page.wait_for_timeout(5000)
        await page.screenshot(path="screenshots/POLISH-768.png", timeout=30000)
        print("done", flush=True)
        await browser.close()
asyncio.run(main())
