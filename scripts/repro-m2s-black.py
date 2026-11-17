"""Reproduce the Missions -> Skills reverse-scroll black screen.

Realistic manual reverse scrolling: after arriving at the Missions section,
scroll backwards (wheel up) in small increments and record the exact frame
where the viewport becomes black, plus the transition state timeline.
"""

import asyncio
import json
import os
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:3001")
OUT = Path("screenshots/repro-m2s")
OUT.mkdir(parents=True, exist_ok=True)


def blackness(path: Path) -> dict:
    img = Image.open(path).convert("RGB")
    w, h = img.size
    # Ignore the fixed navbar strip at the very top.
    region = img.crop((0, 80, w, h))
    small = region.resize((160, 90))
    pixels = list(small.getdata())
    n = len(pixels)
    near_black = sum(1 for r, g, b in pixels if max(r, g, b) < 14)
    mean = sum((r + g + b) / 3 for r, g, b in pixels) / n
    return {
        "mean_brightness": round(mean, 2),
        "near_black_fraction": round(near_black / n, 4),
    }


async def snapshot(page, tag: str) -> dict:
    path = OUT / f"{tag}.png"
    await page.screenshot(path=str(path))
    data = await page.evaluate(
        """() => {
          const vh = window.innerHeight;
          const skills = document.getElementById('skills');
          const missions = document.getElementById('missions');
          const sr = skills ? skills.getBoundingClientRect() : null;
          const mr = missions ? missions.getBoundingClientRect() : null;
          const sw = document.querySelector('[data-skills-world]');
          const mw = document.querySelector('[data-missions-world]');
          const rz = document.querySelector('[data-testid="rasengan-transition"]');
          const kn = document.querySelector('[data-testid="flying-raijin-transition"]');
          const nc = document.querySelector('[data-testid="nature-chakra-transition"]');
          const overlay = rz || kn || nc;
          return {
            scrollY: Math.round(window.scrollY),
            vh,
            skills: sr ? {top: Math.round(sr.top), bottom: Math.round(sr.bottom), h: Math.round(sr.height)} : null,
            missions: mr ? {top: Math.round(mr.top), bottom: Math.round(mr.bottom), h: Math.round(mr.height)} : null,
            skillsWorldOpacity: sw ? getComputedStyle(sw).opacity : null,
            missionsWorldOpacity: mw ? getComputedStyle(mw).opacity : null,
            overlay: overlay ? {
              testid: overlay.getAttribute('data-testid'),
              state: overlay.getAttribute('data-teleport-state'),
              direction: overlay.getAttribute('data-teleport-direction'),
            } : null,
            skillsTextVisibility: (() => {
              const el = document.querySelector('#skills .relative.z-10');
              return el ? getComputedStyle(el).visibility : null;
            })(),
          };
        }"""
    )
    data.update(blackness(path))
    return data


async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-dev-shm-usage"])
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(OUT / "video"),
            record_video_size={"width": 1920, "height": 1080},
        )
        page = await context.new_page()
        page.set_default_timeout(30000)
        await page.goto(BASE, wait_until="domcontentloaded")
        # Wait for the intro reveal to finish: the navbar becomes visible and
        # the loading veil is gone.
        await page.wait_for_selector(
            "header a[href='#missions']",
            state="visible",
            timeout=30000,
        )
        await page.wait_for_timeout(12000)
        await page.wait_for_timeout(1000)

        # Realistic navigation: use the navbar to arrive at Missions. The click
        # is dispatched on the real anchor so the controller's beginTransition
        # path runs unchanged.
        await page.evaluate(
            "() => document.querySelector(\"header a[href='#missions']\").click()"
        )
        # Wait for the arrival transition to fully complete.
        for _ in range(60):
            state = await page.evaluate(
                """() => {
                  const rz = document.querySelector('[data-testid="rasengan-transition"]');
                  const kn = document.querySelector('[data-testid="flying-raijin-transition"]');
                  const nc = document.querySelector('[data-testid="nature-chakra-transition"]');
                  const overlay = rz || kn || nc;
                  return overlay ? overlay.getAttribute('data-teleport-state') : 'IDLE';
                }"""
            )
            if state == "IDLE":
                break
            await page.wait_for_timeout(200)
        await page.wait_for_timeout(800)

        start = await snapshot(page, "00-arrived-missions")
        print("ARRIVED", json.dumps(start), flush=True)

        timeline = [start]
        saw_transition = False
        idle_after_transition = 0
        # Manual reverse scrolling: small wheel-up increments.
        for i in range(1, 91):
            await page.mouse.wheel(0, -60)
            await page.wait_for_timeout(200)
            state = await page.evaluate(
                """() => {
                  const rz = document.querySelector('[data-testid="rasengan-transition"]');
                  const kn = document.querySelector('[data-testid="flying-raijin-transition"]');
                  const nc = document.querySelector('[data-testid="nature-chakra-transition"]');
                  const overlay = rz || kn || nc;
                  return overlay ? overlay.getAttribute('data-teleport-state') : 'IDLE';
                }"""
            )
            snap = await snapshot(page, f"{i:02d}-reverse")
            snap["step"] = i
            snap["wheel_up_px"] = 60
            timeline.append(snap)
            print(
                f"STEP {i:02d} scrollY={snap['scrollY']} "
                f"skillsTop={snap['skills']['top'] if snap['skills'] else None} "
                f"skillsBottom={snap['skills']['bottom'] if snap['skills'] else None} "
                f"missionsTop={snap['missions']['top'] if snap['missions'] else None} "
                f"swOp={snap['skillsWorldOpacity']} mwOp={snap['missionsWorldOpacity']} "
                f"overlay={snap['overlay']['state'] if snap['overlay'] else 'IDLE'} "
                f"mean={snap['mean_brightness']} black={snap['near_black_fraction']}",
                flush=True,
            )
            if snap["overlay"] is not None:
                saw_transition = True
                idle_after_transition = 0
            elif saw_transition:
                idle_after_transition += 1
                if idle_after_transition >= 3:
                    break
            # Stop if we have scrolled past the Skills top.
            if snap["skills"] and snap["skills"]["top"] >= 0:
                break

        # Wait for any in-flight transition to settle and capture the result.
        await page.wait_for_timeout(2500)
        final = await snapshot(page, "99-final")
        print("FINAL", json.dumps(final), flush=True)

        (OUT / "timeline.json").write_text(json.dumps(timeline, indent=2))
        await context.close()
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
