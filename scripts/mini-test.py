import asyncio
from playwright.async_api import async_playwright

BASE="http://localhost:3002"

async def main():
    print("launch")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        print("browser ok")
        page = await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=15000)
        print("goto ok")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="screenshots/A-home.png")
        print("A done")
        # scroll trigger
        for i in range(5):
            await page.mouse.wheel(0, 250)
            await page.wait_for_timeout(200)
        await page.wait_for_timeout(400)
        await page.screenshot(path="screenshots/B-black.png")
        print("B done")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/C-kunai-entering.png")
        print("C done")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/D-kunai-centre.png")
        print("D done")
        await page.wait_for_timeout(800)
        await page.screenshot(path="screenshots/E-flash.png")
        print("E done")
        await browser.close()
        print("EXIT OK")

asyncio.run(main())
