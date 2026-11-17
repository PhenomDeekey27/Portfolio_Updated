import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3005"
async def shoot(page, name):
    await page.screenshot(path=f"screenshots/POLISH-{name}.png", timeout=30000)
    print(f"captured POLISH-{name}", flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        for w,h,name in [(1920,1080,"1920"),(1366,768,"1366"),(768,1024,"768"),(390,844,"390")]:
            page=await browser.new_page(viewport={"width":w,"height":h})
            await page.goto(BASE, wait_until="domcontentloaded")
            await page.wait_for_timeout(10000)
            # trigger Home->About
            for i in range(5):
                await page.mouse.wheel(0,250)
                await page.wait_for_timeout(160)
            await page.wait_for_timeout(5000)
            await shoot(page, name)
            await page.close()
        await browser.close()
        print("DONE", flush=True)
asyncio.run(main())
