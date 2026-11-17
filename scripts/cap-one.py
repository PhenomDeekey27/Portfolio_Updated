import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3024"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1366,"height":768})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=15000)
        print("goto ok", flush=True)
        await page.wait_for_timeout(10000)
        print("waited", flush=True)
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(5000)
        print("scrolled", flush=True)
        await page.screenshot(path="screenshots/FINAL3-1366v2.png", timeout=15000)
        print("shot ok", flush=True)
        await browser.close()
asyncio.run(main())
