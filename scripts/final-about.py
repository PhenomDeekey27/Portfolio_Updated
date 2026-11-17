import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3014"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1366,"height":768})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(11000)
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(5500)
        await page.screenshot(path="screenshots/FINAL2-about-top.png", timeout=30000)
        print("top done", flush=True)
        await page.evaluate("()=>window.scrollBy(0,550)")
        await page.wait_for_timeout(1200)
        await page.screenshot(path="screenshots/FINAL2-about-mid.png", timeout=30000)
        print("mid done", flush=True)
        await page.evaluate("()=>window.scrollBy(0,650)")
        await page.wait_for_timeout(1200)
        await page.screenshot(path="screenshots/FINAL2-about-low.png", timeout=30000)
        print("low done", flush=True)
        # 390 mobile
        mpage=await browser.new_page(viewport={"width":390,"height":844})
        await mpage.goto(BASE, wait_until="domcontentloaded")
        await mpage.wait_for_timeout(11000)
        for i in range(5):
            await mpage.mouse.wheel(0,250); await mpage.wait_for_timeout(160)
        await mpage.wait_for_timeout(5500)
        await mpage.screenshot(path="screenshots/FINAL2-mobile.png", timeout=30000)
        print("mobile done", flush=True)
        # 1920
        wpage=await browser.new_page(viewport={"width":1920,"height":1080})
        await wpage.goto(BASE, wait_until="domcontentloaded")
        await wpage.wait_for_timeout(11000)
        for i in range(5):
            await wpage.mouse.wheel(0,250); await wpage.wait_for_timeout(160)
        await wpage.wait_for_timeout(5500)
        await wpage.screenshot(path="screenshots/FINAL2-1920.png", timeout=30000)
        print("wide done", flush=True)
        await browser.close()
asyncio.run(main())
