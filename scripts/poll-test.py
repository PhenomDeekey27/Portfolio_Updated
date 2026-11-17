import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3002"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(7000)
        print("HOME ready")
        # sample states during wheel scroll
        seq=[]
        for i in range(6):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(150)
            st=await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
            if st not in seq: seq.append(st)
            print(f"wheel {i} -> {st}")
        # poll every 200ms for 6s
        for k in range(30):
            st=await page.evaluate("()=>document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE'")
            if not seq or seq[-1]!=st:
                seq.append(st)
                print(f"poll {k} -> {st}")
            await page.wait_for_timeout(200)
        print("SEQUENCE:", " -> ".join(seq))
        await page.screenshot(path="screenshots/A-home.png", animations="disabled", timeout=15000)
        # after transition, screenshot About
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/F-world-no-text.png", animations="disabled", timeout=15000)
        await browser.close()
        print("DONE")
asyncio.run(main())
