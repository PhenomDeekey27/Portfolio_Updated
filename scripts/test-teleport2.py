import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:3002"
OUT = Path("screenshots")
OUT.mkdir(exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-dev-shm-usage"])
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        page.set_default_timeout(20000)
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(6000)
        await page.screenshot(path=str(OUT / "A-home.png"))
        print("A done")
        # Gradual scroll via wheel + evaluate in chunks
        for i in range(5):
            await page.mouse.wheel(0, 200)
            await page.wait_for_timeout(250)
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(OUT / "B-black.png"))
        print("B done, state:", await page.evaluate("() => document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')"))
        await page.wait_for_timeout(800)
        await page.screenshot(path=str(OUT / "C-kunai-entering.png"))
        print("C done, state:", await page.evaluate("() => document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')"))
        await page.wait_for_timeout(900)
        await page.screenshot(path=str(OUT / "D-kunai-centre.png"))
        print("D done, state:", await page.evaluate("() => document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')"))
        await page.wait_for_timeout(600)
        await page.screenshot(path=str(OUT / "E-flash.png"))
        print("E done")
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / "F-world-no-text.png"))
        print("F done")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=str(OUT / "G-text-appearing.png"))
        print("G done, scrollY:", await page.evaluate("() => window.scrollY"), "about vis:", await page.evaluate("() => { const el=document.querySelector('[data-about-section]'); return el ? getComputedStyle(el).visibility : 'missing'; }"))
        await browser.close()
        print("ALL DONE")

if __name__ == "__main__":
    asyncio.run(main())
