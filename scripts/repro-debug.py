import asyncio
from playwright.async_api import async_playwright
BASE="http://localhost:3011"
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":1280,"height":800})
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(10000)
        async def dbg():
            return await page.evaluate("""()=>{
              const h=document.getElementById('home'), a=document.getElementById('about');
              const hr=h.getBoundingClientRect(), ar=a.getBoundingClientRect();
              return {scrollY:window.scrollY, homeTop:hr.top, homeBottom:hr.bottom, homeH:h.offsetHeight, homeOff:h.offsetTop, aboutTop:ar.top, aboutH:a.offsetHeight, y:window.scrollY+window.innerHeight*0.65};
            }""")
        print("init", await dbg(), flush=True)
        for i in range(5):
            await page.mouse.wheel(0,250); await page.wait_for_timeout(160)
        await page.wait_for_timeout(4500)
        print("in about", await dbg(), flush=True)
        await page.evaluate("()=>window.scrollTo(0,0)")
        await page.wait_for_timeout(4500)
        print("back home", await dbg(), "active=", await page.evaluate("()=>window.__activeRef?.()"), "isTrans=", await page.evaluate("()=>window.__isTrans?.()"), flush=True)
        # now scroll stepwise
        for i in range(6):
            await page.mouse.wheel(0,250)
            await page.wait_for_timeout(300)
            st = await page.evaluate("()=>({s:document.querySelector('[data-testid=\"kunai-transition\"]')?.getAttribute('data-teleport-state')||'IDLE', a:window.__activeRef?.(), t:window.__isTrans?.()})")
            d = await dbg()
            print(f"re wheel {i} state={st} scrollY={d['scrollY']} y={d['y']} homeH={d['homeH']} homeOff={d['homeOff']} cond={d['y'] > d['homeOff']+d['homeH']-40}", flush=True)
            print(" active=", await page.evaluate("()=>window.__activeRef?.()"), " isTrans=", await page.evaluate("()=>window.__isTrans?.()"), flush=True)
        await browser.close()
asyncio.run(main())
