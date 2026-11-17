import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3003"
async def cap(page, path):
    await page.screenshot(path=path, animations="disabled", timeout=20000)
    print(f"captured {path}", flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(7000)
        await cap(page, "screenshots/A-home.png")
        # trigger
        for i in range(4):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(150)
        await page.wait_for_timeout(200)
        await cap(page, "screenshots/B-black.png")
        await page.wait_for_timeout(900)
        await cap(page, "screenshots/C-kunai-entering.png")
        await page.wait_for_timeout(900)
        await cap(page, "screenshots/D-kunai-centre.png")
        await page.wait_for_timeout(700)
        await cap(page, "screenshots/E-flash.png")
        await page.wait_for_timeout(700)
        await cap(page, "screenshots/F-world-no-text.png")
        await page.wait_for_timeout(2000)
        await cap(page, "screenshots/G-text-appearing.png")
        # reverse
        await page.evaluate("()=>window.scrollTo(0,0)")
        await page.wait_for_timeout(500)
        await cap(page, "screenshots/R1-black-reverse.png")
        await page.wait_for_timeout(3500)
        await cap(page, "screenshots/R2-home-back.png")
        # navbar
        try:
            await page.get_by_role("link", name="About").first.click(timeout=8000)
            await page.wait_for_timeout(1500)
            await cap(page, "screenshots/N1-navbar-kunai.png")
            await page.wait_for_timeout(3500)
            await cap(page, "screenshots/N2-navbar-about.png")
            print("NAV OK", flush=True)
        except Exception as e:
            print(f"NAV FAIL {e}", flush=True)
        # mobile
        mpage=await browser.new_page(viewport={"width":390,"height":844})
        await mpage.goto(BASE, wait_until="domcontentloaded")
        await mpage.wait_for_timeout(7000)
        await mpage.screenshot(path="screenshots/M1-mobile-home.png", animations="disabled", timeout=20000)
        for i in range(4):
            await mpage.mouse.wheel(0,250)
            await mpage.wait_for_timeout(150)
        await mpage.wait_for_timeout(3500)
        await mpage.screenshot(path="screenshots/M2-mobile-about.png", animations="disabled", timeout=20000)
        print("MOBILE DONE", flush=True)
        await browser.close()
        print("ALL DONE", flush=True)
asyncio.run(main())
