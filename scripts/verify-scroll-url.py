"""Verify address bar follows scroll crossings and deep links to hidden-idle sections."""
import asyncio
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1200)
        skip = page.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await page.wait_for_timeout(1000)

        seen = []
        for step in range(140):
            await page.mouse.wheel(0, 420)
            await page.wait_for_timeout(90)
            path = await page.evaluate("() => location.pathname + location.hash")
            if not seen or seen[-1] != path:
                seen.append(path)
            y = await page.evaluate("() => Math.round(scrollY)")
            if y > 30000:
                break
        print("scroll paths:", seen)

        # Direct /about deep link: content must be visible (not pending).
        about = await browser.new_page(viewport={"width": 390, "height": 844})
        await about.goto(f"{BASE}/about", wait_until="domcontentloaded", timeout=60000)
        await about.wait_for_timeout(2500)
        state = await about.evaluate(
            """() => ({
              top: Math.round(document.getElementById('about').getBoundingClientRect().top),
              phase: document.querySelector('[data-section-content="about"]')?.getAttribute('data-reveal-phase'),
              url: location.pathname + location.hash,
            })"""
        )
        print("direct /about:", state)
        await browser.close()
        if state["phase"] != "content" or abs(state["top"]) > 2 or state["url"] != "/about":
            raise SystemExit("about deep link failed")
        if "/about" not in seen:
            raise SystemExit("scroll did not update URL")


asyncio.run(main())
