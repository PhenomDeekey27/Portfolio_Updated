"""Verify the phone menu now plays a distinct identity per destination."""
import asyncio
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")
EXPECTED = {
    "about": "flying-raijin-transition",
    "skills": "nature-chakra-transition",
    "missions": "rasengan-transition",
    "experience": "shinobi-map-transition",
    "contact": "hokage-summon-transition",
}


async def main():
    failures = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for target, expected in EXPECTED.items():
            context = await browser.new_context(
                viewport={"width": 390, "height": 844},
                has_touch=True,
                is_mobile=True,
            )
            page = await context.new_page()
            await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(5000)
            await page.get_by_role("button", name="Open navigation menu").click()
            await page.wait_for_timeout(350)
            await page.locator(f'#mobile-navigation a[href="/{target}"]').click()
            seen = None
            for _ in range(60):
                st = await page.evaluate(
                    "() => { const ov = document.querySelector('[data-teleport-state]'); return ov ? ov.getAttribute('data-testid') : null; }"
                )
                if st:
                    seen = st
                    break
                await page.wait_for_timeout(50)
            await page.wait_for_timeout(2600)
            final = await page.evaluate(
                "() => ({ path: location.pathname, hash: location.hash, scrollY: Math.round(scrollY) })"
            )
            ok = seen == expected and final["path"] == f"/{target}" and not final["hash"]
            print(("PASS" if ok else "FAIL"), target, "->", seen, "| url:", final)
            if not ok:
                failures.append(target)
            await context.close()
        await browser.close()
    if failures:
        raise SystemExit(f"failures: {failures}")


asyncio.run(main())
