import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3012"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(10000)
        async def log():
            return await page.evaluate("()=>window.__log||[]")
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(4500)
        print("after about log", await log(), "active", await page.evaluate("()=>window.__activeRef?.()"), flush=True)
        await page.evaluate("()=>window.scrollTo(0,0)")
        await page.wait_for_timeout(700)
        print("back700 log", await log(), "active", await page.evaluate("()=>window.__activeRef?.()"), flush=True)
        await page.wait_for_timeout(4000)
        print("back done log", await log(), "active", await page.evaluate("()=>window.__activeRef?.()"), "scrollY", await page.evaluate("()=>window.scrollY"), flush=True)
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(700)
        print("re log", await log(), "active", await page.evaluate("()=>window.__activeRef?.()"), flush=True)
        await browser.close()
asyncio.run(main())
