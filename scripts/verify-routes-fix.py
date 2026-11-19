"""Verify section routes, hero timing and history behaviour."""
import asyncio
import os

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:3001")


async def wait_sections(page, timeout=12000):
    waited = 0
    while waited < timeout:
        info = await page.evaluate(
            """() => {
              const el = document.getElementById('skills');
              return { top: el ? Math.round(el.getBoundingClientRect().top) : null, y: Math.round(scrollY) };
            }"""
        )
        if info["top"] is not None and abs(info["top"]) < 8:
            return info
        await page.wait_for_timeout(120)
        waited += 120
    return info


async def main():
    failures = []

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Direct section route (desktop)
        page = await browser.new_page(viewport={"width": 1366, "height": 768})
        await page.goto(f"{BASE}/skills", wait_until="domcontentloaded", timeout=60000)
        info = await wait_sections(page)
        path = await page.evaluate("() => location.pathname + location.hash")
        phase = await page.evaluate(
            "() => document.querySelector('[data-section-content=\"skills\"]')?.getAttribute('data-reveal-phase')"
        )
        loader = await page.evaluate(
            "() => Number(getComputedStyle(document.querySelector('[data-raijin-loader]')).opacity)"
        )
        ok = abs(info["top"]) <= 2 and path == "/skills" and phase == "content" and loader == 0
        print(("PASS" if ok else "FAIL"), "direct /skills", info, path, phase, "loader", loader)
        if not ok:
            failures.append("direct /skills")

        # Direct section route (phone)
        mobile = await browser.new_context(
            viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True
        )
        mp = await mobile.new_page()
        await mp.goto(f"{BASE}/missions", wait_until="domcontentloaded", timeout=60000)
        mtop = None
        for _ in range(80):
            mtop = await mp.evaluate(
                "() => Math.round(document.getElementById('missions').getBoundingClientRect().top)"
            )
            if abs(mtop) < 8:
                break
            await mp.wait_for_timeout(120)
        murl = await mp.evaluate("() => location.pathname + location.hash")
        print(("PASS" if abs(mtop) <= 2 and murl == "/missions" else "FAIL"), "direct /missions", mtop, murl)
        if not (abs(mtop) <= 2 and murl == "/missions"):
            failures.append("direct /missions")

        # Legacy fragment migration
        lp = await browser.new_page(viewport={"width": 1366, "height": 768})
        await lp.goto(f"{BASE}/#skills", wait_until="domcontentloaded", timeout=60000)
        ltop = None
        for _ in range(80):
            ltop = await lp.evaluate(
                "() => Math.round(document.getElementById('skills').getBoundingClientRect().top)"
            )
            if abs(ltop) < 8:
                break
            await lp.wait_for_timeout(120)
        lurl = await lp.evaluate("() => location.pathname + location.hash")
        print(("PASS" if abs(ltop) <= 2 and lurl == "/skills" else "FAIL"), "legacy #skills", ltop, lurl)
        if not (abs(ltop) <= 2 and lurl == "/skills"):
            failures.append("legacy")

        # Back / forward through explicit navigation
        hp = await browser.new_page(viewport={"width": 1366, "height": 768})
        await hp.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        await hp.wait_for_timeout(2200)
        skip = hp.get_by_role("button", name="Skip intro")
        if await skip.count():
            try:
                await skip.first.click(timeout=2000)
            except Exception:
                pass
        await hp.wait_for_timeout(1200)
        await hp.locator('nav[aria-label="Primary navigation"] a[href="/skills"]').click()
        await hp.wait_for_timeout(3000)
        p1 = await hp.evaluate("() => location.pathname")
        await hp.locator('nav[aria-label="Primary navigation"] a[href="/missions"]').click()
        await hp.wait_for_timeout(3000)
        p2 = await hp.evaluate("() => location.pathname")
        await hp.go_back()
        await hp.wait_for_timeout(3000)
        p3 = await hp.evaluate("() => location.pathname")
        await hp.go_forward()
        await hp.wait_for_timeout(3000)
        p4 = await hp.evaluate("() => location.pathname")
        ok = (p1, p2, p3, p4) == ("/skills", "/missions", "/skills", "/missions")
        print(("PASS" if ok else "FAIL"), "history", p1, p2, p3, p4)
        if not ok:
            failures.append("history")

        # Unknown route is a 404
        up = await browser.new_page()
        resp = await up.goto(f"{BASE}/not-a-section", wait_until="domcontentloaded", timeout=60000)
        print(("PASS" if resp and resp.status == 404 else "FAIL"), "unknown route", resp.status if resp else None)
        if not resp or resp.status != 404:
            failures.append("404")

        await browser.close()

    if failures:
        raise SystemExit(f"failures: {failures}")


asyncio.run(main())
