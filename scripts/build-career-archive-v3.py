"""Phase 6.4 — author the Experience archive chamber (v3).

The site has no image-generation capability in this environment, so the
Experience environment is original vector artwork. This script emits the
editable SVG (`career-archive-chamber-v3.svg`), which is then rasterised to
`career-archive-chamber-v3.webp` with `scripts/render-scene.py`.

The scene is a low-key one-point-perspective shinobi archive:
  * receding shelf wings packed with rolled records, boxes and ledgers,
  * a dark central vault holding a low reading desk and a hanging scroll
    (negative space for the Career Ledger copy),
  * warm paper lanterns at the far edges, a distant candle, a leaning ladder,
  * faint cartographic ink and document cubbies on the rear wall,
  * depth haze, dust in the light, a soft-focus foreground frame,
  * film grain and a heavy vignette.

Bright accents stay at the extreme left/right edges; the centre is quiet
shadow so the ledger text keeps its contrast.

Usage:
    python scripts/build-career-archive-v3.py
"""

import math
import os
import random

W, H = 2560, 1440
VX, VY = 1280, 640

# --- palette ---------------------------------------------------------------
GOLD = "#c9a35f"
GOLD_PALE = "#e7d0a1"
CRIMSON = "#3a1515"

parts = []
defs = []


def lin(gid, p1, p2, stops, spread="userSpaceOnUse"):
    body = "".join(
        f'<stop offset="{o}" stop-color="{c}"'
        + (f' stop-opacity="{a}"' if a is not None else "")
        + "/>"
        for o, c, a in stops
    )
    defs.append(
        f'<linearGradient id="{gid}" gradientUnits="{spread}" '
        f'x1="{p1[0]}" y1="{p1[1]}" x2="{p2[0]}" y2="{p2[1]}">{body}</linearGradient>'
    )
    return f"url(#{gid})"


def rad(gid, c, r, stops, fx=None, fy=None):
    body = "".join(
        f'<stop offset="{o}" stop-color="{c}"'
        + (f' stop-opacity="{a}"' if a is not None else "")
        + "/>"
        for o, c, a in stops
    )
    extra = f' fx="{fx}"' if fx is not None else ""
    extra += f' fy="{fy}"' if fy is not None else ""
    defs.append(
        f'<radialGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'cx="{c[0]}" cy="{c[1]}" r="{r}"{extra}>{body}</radialGradient>'
    )
    return f"url(#{gid})"


def blur(gid, sd):
    defs.append(
        f'<filter id="{gid}" x="-15%" y="-15%" width="130%" height="130%">'
        f'<feGaussianBlur stdDeviation="{sd}"/></filter>'
    )
    return f"url(#{gid})"


def rect(x, y, w, h, fill, opacity=None, extra=""):
    op = f' opacity="{opacity}"' if opacity is not None else ""
    parts.append(
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}"{op}{extra}/>'
    )


def poly(points, fill, opacity=None, extra=""):
    d = " ".join(f"{x:.1f},{y:.1f}" for x, y in points)
    op = f' opacity="{opacity}"' if opacity is not None else ""
    parts.append(f'<polygon points="{d}" fill="{fill}"{op}{extra}/>')


def path(d, fill="none", stroke=None, sw=1, opacity=None, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw:.2f}"' if stroke else ""
    op = f' opacity="{opacity}"' if opacity is not None else ""
    parts.append(f'<path d="{d}" fill="{fill}"{s}{op}{extra}/>')


def warm(f, cool=0.0):
    """Warm record tone scaled by local light, with a little cool ambience."""
    r = 150 * f + 26 * cool
    g = 118 * f + 34 * cool
    b = 82 * f + 34 * cool
    return f"#{int(min(255, r)):02x}{int(min(255, g)):02x}{int(min(255, b)):02x}"


def falloff(x, y, lx, ly, spread=900.0):
    """Local light factor for an object near a lantern."""
    d = math.hypot(x - lx, y - ly)
    return min(1.0, 0.2 + 0.95 * math.exp(-d / spread))


def scale_y(y_back, t):
    """Map a height on the rear-wall plane out along a side wall (t=1 back)."""
    return VY + (y_back - VY) * (1 + (1 - t) * 1.05)


def wall_x(t, side):
    return 660 * t if side == "left" else 2560 - 660 * t


# --- base gradients --------------------------------------------------------
BG = lin("bg", (0, 0), (0, H), [
    (0, "#06080a", None),
    (0.3, "#090b0b", None),
    (0.66, "#080a09", None),
    (1, "#040505", None),
])
CEIL = lin("ceil", (0, 0), (0, 260), [
    (0, "#040506", None),
    (0.72, "#0b0c0b", None),
    (1, "#12110d", None),
])
FLOOR = lin("floor", (0, 1020), (0, H), [
    (0, "#17150f", None),
    (0.22, "#100f0c", None),
    (0.6, "#0a0a09", None),
    (1, "#040404", None),
])
BACK_WALL = lin("backwall", (660, 240), (1900, 1020), [
    (0, "#1a1611", None),
    (0.42, "#15130f", None),
    (0.78, "#100f0c", None),
    (1, "#0a0a08", None),
])
WALL_L = lin("wallL", (0, 0), (660, 0), [
    (0, "#0a0b09", None),
    (0.4, "#13110d", None),
    (0.78, "#1b1610", None),
    (1, "#241b13", None),
])
WALL_R = lin("wallR", (1900, 0), (2560, 0), [
    (0, "#241b13", None),
    (0.32, "#1b1610", None),
    (0.72, "#12100c", None),
    (1, "#090a08", None),
])
VAULT = rad("vault", (1280, 700), 660, [
    (0, "#0b0c0b", None),
    (0.55, "#070808", None),
    (1, "#050606", None),
])

SOFT2 = blur("soft2", 2.0)
SOFT5 = blur("soft5", 5.5)
SOFT12 = blur("soft12", 12)
SOFT28 = blur("soft28", 28)


# --- ceiling ---------------------------------------------------------------
def ceiling():
    poly([(0, 0), (660, 240), (1900, 240), (2560, 0)], CEIL)

    # rafters converging on the vanishing point
    for t in (0.05, 0.16, 0.29, 0.43, 0.57, 0.71, 0.85):
        y = scale_y(252, t) - 34 * (1 - t)
        xl, xr = 660 * t, 2560 - 660 * t
        w = 16 * (1 + (1 - t) * 2.8)
        path(f"M {xl:.1f} {y:.1f} L {VX} 252 L {xr:.1f} {y:.1f}", stroke="#080907", sw=w, opacity=0.92)
        path(
            f"M {xl:.1f} {y + w * 0.62:.1f} L {VX} 259 L {xr:.1f} {y + w * 0.62:.1f}",
            stroke="#6b4c2a",
            sw=1.3 * (1 + (1 - t) * 1.5),
            opacity=0.07 + 0.08 * (1 - t),
        )
        path(
            f"M {xl:.1f} {y - w * 0.45:.1f} L {VX} 246 L {xr:.1f} {y - w * 0.45:.1f}",
            stroke="#000000",
            sw=1.6,
            opacity=0.5,
        )

    # heavy cross beams
    for t, h in ((0.1, 30), (0.27, 22), (0.48, 16), (0.7, 11)):
        y = scale_y(252, t)
        xl, xr = 660 * t, 2560 - 660 * t
        path(f"M {xl:.1f} {y:.1f} L {xr:.1f} {y:.1f}", stroke="#070806", sw=h, opacity=0.95)
        path(f"M {xl:.1f} {y + h * 0.5:.1f} L {xr:.1f} {y + h * 0.5:.1f}", stroke="#7a5832", sw=1.2, opacity=0.09)

    # deep hanging lamp
    glow = rad("ceilLamp", (1280, 306), 240, [
        (0, "rgba(255,190,116,0.22)", None),
        (0.4, "rgba(240,160,80,0.055)", None),
        (1, "rgba(240,160,80,0)", None),
    ])
    parts.append(f'<ellipse cx="1280" cy="306" rx="240" ry="210" fill="{glow}" opacity="0.8"/>')
    rect(1274, 236, 12, 34, "#2c2014")
    rect(1254, 268, 52, 8, "#3c2b18")
    rect(1258, 276, 44, 62, lin("ceilLantern", (1258, 0), (1302, 0), [
        (0, "#6d4318", None),
        (0.5, "#e8bd78", None),
        (1, "#5c3512", None),
    ]), 0.5)
    rect(1254, 338, 52, 8, "#3c2b18")

    # light shafts from the upper-left lantern
    shaft = lin("shaft", (0, 0), (0, 900), [
        (0, "rgba(255,196,128,0.10)", None),
        (0.55, "rgba(250,180,104,0.028)", None),
        (1, "rgba(250,180,104,0)", None),
    ])
    poly([(150, 0), (370, 0), (760, 900), (330, 900)], shaft, 0.9)


# --- rear wall -------------------------------------------------------------
def rear_wall():
    rect(660, 240, 1240, 780, BACK_WALL)

    # panelling + seams
    for x in (660, 840, 1010, 1550, 1720, 1900):
        path(f"M {x} 240 L {x} 1020", stroke="#000000", sw=3, opacity=0.32)
        path(f"M {x + 3} 240 L {x + 3} 1020", stroke="#5c4529", sw=1, opacity=0.07)
    for y in (360, 470, 800):
        path(f"M 660 {y} L 1900 {y}", stroke="#000000", sw=3.4, opacity=0.34)
        path(f"M 660 {y + 3} L 1900 {y + 3}", stroke="#5c4529", sw=1.1, opacity=0.06)

    # karakami fibres
    for i in range(48):
        y = 250 + i * 16
        path(
            f"M 664 {y:.1f} Q 1280 {y + 7:.1f} 1896 {y - 2:.1f}",
            stroke="#463a2a",
            sw=0.8,
            opacity=0.05,
        )

    # document cubbies on the flanking panels
    for side_x, cols, rows in ((690, 4, 5), (1600, 4, 5)):
        for c in range(cols):
            for r in range(rows):
                x = side_x + c * 52
                y = 500 + r * 56
                rect(x, y, 44, 48, "#0a0a08", 0.72, ' rx="2"')
                rect(x + 4, y + 6, 36, 36, "#14120e", 0.85, ' rx="1.5"')
                # rolled document inside some cubbies
                if (c + r) % 3 == 0:
                    rect(x + 12, y + 12, 8, 26, "#3a2f20", 0.8, ' rx="4"')
                    rect(x + 22, y + 15, 7, 23, "#2c2418", 0.75, ' rx="3.5"')
                path(f"M {x + 2} {y + 2} L {x + 42} {y + 2}", stroke="#8a6638", sw=1, opacity=0.1)

    # cartographic ink panel (left of the vault)
    for k in range(5):
        path(
            f"M 700 {580 + k * 40} C 780 {500 + k * 46}, 860 {660 + k * 30}, 950 {560 + k * 44}",
            stroke=GOLD,
            sw=1.2,
            opacity=0.11 - k * 0.014,
        )
    for k in range(4):
        path(
            f"M {726 + k * 52} 520 q 20 42 6 100 q -8 34 22 50",
            stroke=GOLD,
            sw=1,
            opacity=0.07,
        )
    path("M 706 520 L 950 520", stroke=GOLD, sw=1.4, opacity=0.08)
    path("M 706 760 L 950 760", stroke=GOLD, sw=1.4, opacity=0.08)

    # hanging fabric banner (right of the vault)
    poly([(1620, 380), (1750, 396), (1746, 800), (1616, 784)], "#150a0a", 0.92)
    poly([(1624, 384), (1746, 400), (1742, 792), (1620, 776)], "#1e0e0e", 0.6)
    path("M 1620 380 L 1750 396", stroke="#553a22", sw=5, opacity=0.35)
    path("M 1683 470 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0", stroke="#6b2424", sw=1.6, opacity=0.22)
    path("M 1683 448 L 1699 490 L 1667 490 Z", stroke="#6b2424", sw=1.2, opacity=0.2)
    for k in range(6):
        path(f"M 1618 {806 + k * 5} L 1748 {812 + k * 5}", stroke="#2a1212", sw=2, opacity=0.5)

    # central vault (negative space)
    vault = (
        "M 1016 1020 L 1016 606 C 1016 442 1136 348 1280 348 "
        "C 1424 348 1544 442 1544 606 L 1544 1020 Z"
    )
    path(vault, fill=VAULT)
    path(vault, stroke="#090a09", sw=18, opacity=0.8)
    path(vault, stroke="#5c4529", sw=1.6, opacity=0.16)
    inner = (
        "M 1050 1020 L 1050 612 C 1050 460 1156 380 1280 380 "
        "C 1404 380 1510 460 1510 612 L 1510 1020 Z"
    )
    path(inner, stroke="#6b4e2d", sw=1.1, opacity=0.13)
    path("M 1280 382 L 1280 1018", stroke="#000000", sw=2, opacity=0.22)

    # keystone detail
    poly([(1256, 344), (1304, 344), (1316, 372), (1244, 372)], "#1f180f", 0.85)
    path("M 1244 372 L 1316 372", stroke="#7a5832", sw=1, opacity=0.16)

    # hanging scroll
    rect(1192, 492, 176, 392, lin("hscroll", (1192, 492), (1368, 884), [
        (0, "#2b261d", None),
        (0.5, "#1c1913", None),
        (1, "#0d0c0a", None),
    ]), 0.9)
    rect(1186, 484, 188, 12, "#2c2419", 0.95)
    rect(1186, 878, 188, 12, "#2c2419", 0.95)
    path("M 1280 604 m -44 0 a 44 44 0 1 0 88 0 a 44 44 0 1 0 -88 0", stroke=GOLD, sw=1.4, opacity=0.16)
    path("M 1280 572 L 1306 634 L 1254 634 Z", stroke=GOLD, sw=1.1, opacity=0.14)
    for k in range(6):
        path(f"M 1232 {694 + k * 30} L 1328 {694 + k * 30}", stroke=GOLD, sw=0.9, opacity=0.05)

    # skirting + floor socket
    rect(660, 1006, 1240, 14, "#080807", 0.9)
    path("M 660 1006 L 1900 1006", stroke="#5c4529", sw=1, opacity=0.13)


# --- shelf wings -----------------------------------------------------------
ITEM_SEQ = [0]


def scroll_roll(cx, cy, w, h, bright, seed, rotate=0.0):
    """A rolled document lying on its side: capsule body, paper ends, cord ties."""
    fill = lin(f"roll{seed}", (0, cy - h / 2), (0, cy + h / 2), [
        (0, warm(0.16 * bright), None),
        (0.22, warm(0.62 * bright), None),
        (0.42, warm(1.05 * bright), None),
        (0.62, warm(0.55 * bright), None),
        (0.86, warm(0.16 * bright), None),
        (1, "#070605", None),
    ])
    parts.append(f'<g transform="rotate({rotate:.1f} {cx:.1f} {cy:.1f})">')
    rect(cx - w / 2, cy - h / 2, w, h, fill, 0.97, f' rx="{h / 2:.1f}"')
    # paper ends
    for ex in (cx - w / 2 + h * 0.16, cx + w / 2 - h * 0.16):
        ell = rad(f"end{seed}{int(ex)}", (ex, cy), max(h * 0.3, 4), [
            (0, f"rgba(34,27,18,{0.8 * bright + 0.15:.2f})", None),
            (1, "rgba(20,16,11,0)", None),
        ])
        parts.append(f'<ellipse cx="{ex:.1f}" cy="{cy:.1f}" rx="{h * 0.28:.1f}" ry="{h * 0.5:.1f}" fill="{ell}"/>')
    # cord ties
    for f in (0.3, 0.72):
        path(f"M {cx - w / 2 + w * f:.1f} {cy - h / 2 + 0.4:.1f} L {cx - w / 2 + w * f:.1f} {cy + h / 2 - 0.4:.1f}", stroke="#090705", sw=max(1.4, h * 0.18), opacity=0.66)
    path(f"M {cx - w / 2 + 1:.1f} {cy - h * 0.34:.1f} L {cx + w / 2 - 1:.1f} {cy - h * 0.34:.1f}", stroke="#efd3a0", sw=1, opacity=0.12 * bright + 0.03)
    parts.append("</g>")


def bound_books(x, base, width, height, bright, seed, rnd):
    """A run of bound ledgers standing on the shelf."""
    n = 5
    bw = width / (n + 0.6)
    for i in range(n):
        w_ = bw * (0.72 + 0.3 * rnd.random())
        cx = x - width / 2 + bw * (i + 0.7)
        h_ = height * (0.72 + 0.24 * rnd.random())
        fill = lin(f"book{seed}{i}", (cx - w_ / 2, 0), (cx + w_ / 2, 0), [
            (0, "#080706", None),
            (0.2, warm(0.2 * bright), None),
            (0.55, warm(0.55 * bright), None),
            (0.8, warm(0.18 * bright), None),
            (1, "#080706", None),
        ])
        rect(cx - w_ / 2, base - h_, w_, h_, fill, 0.97, ' rx="1.6"')
        path(f"M {cx - w_ / 2 + 1:.1f} {base - h_ + 3:.1f} L {cx + w_ / 2 - 1:.1f} {base - h_ + 3:.1f}", stroke="#c9a35f", sw=0.9, opacity=0.1 * bright + 0.02)
        if i % 2 == 0:
            path(f"M {cx - w_ / 2 + 1:.1f} {base - h_ * 0.28:.1f} L {cx + w_ / 2 - 1:.1f} {base - h_ * 0.28:.1f}", stroke="#d8b57c", sw=0.8, opacity=0.1 * bright + 0.02)


def cubby_items(rnd, x, base, width, height, note, bright=1.0, cool=0.0):
    """Archival contents: mostly horizontal rolls, ledgers and record boxes."""
    ITEM_SEQ[0] += 1
    seed = ITEM_SEQ[0]
    kind = note % 6

    if kind in (0, 4):  # stacked horizontal rolls
        n = 3 if kind == 0 else 4
        for i in range(n):
            w_ = width * (0.94 - i * 0.06 - rnd.random() * 0.08)
            h_ = height * 0.17
            cx = x + (rnd.random() - 0.5) * width * 0.08
            cy = base - h_ * (i + 0.62) - 1
            scroll_roll(cx, cy, w_, h_, bright * (1 - 0.06 * i), seed * 10 + i, (rnd.random() - 0.5) * 2.4)
        if kind == 4:
            sw_ = width * 0.18
            cx = x + width * 0.38
            h_ = height * 0.55
            rect(cx - sw_ / 2, base - h_, sw_, h_, warm(0.24 * bright), 0.97, f' rx="{sw_ * 0.24:.1f}"')

    elif kind == 1:  # bound ledgers
        bound_books(x, base, width, height, bright, seed, rnd)

    elif kind == 2:  # record box + rolls on top
        bw = width * 0.74
        bh = height * 0.4
        rect(x - bw / 2, base - bh, bw, bh, warm(0.14 * bright), 0.97, ' rx="2"')
        path(f"M {x - bw / 2 + 2:.1f} {base - bh + 1:.1f} L {x + bw / 2 - 2:.1f} {base - bh + 1:.1f}", stroke="#a17c48", sw=0.9, opacity=0.1 * bright + 0.03)
        path(f"M {x - bw / 2 + 10:.1f} {base - bh + 12:.1f} L {x + bw / 2 - 10:.1f} {base - bh + 12:.1f}", stroke="#0a0806", sw=1.6, opacity=0.55)
        path(f"M {x - bw / 2 + 8:.1f} {base - bh * 0.5:.1f} L {x + bw / 2 - 8:.1f} {base - bh * 0.5:.1f}", stroke="#0a0806", sw=1.2, opacity=0.4)
        for i in range(2):
            scroll_roll(x, base - bh - height * 0.1 * (i + 0.6), bw * (0.9 - i * 0.1), height * 0.16, bright, seed * 10 + i, 0)

    elif kind == 3:  # leaning scroll + a roll
        sw_ = width * 0.3
        cx = x - width * 0.14
        h_ = height * 0.82
        fill = lin(f"lean{seed}", (cx - sw_ / 2, 0), (cx + sw_ / 2, 0), [
            (0, "#070605", None),
            (0.2, warm(0.2 * bright), None),
            (0.48, warm(0.72 * bright), None),
            (0.62, warm(0.85 * bright), None),
            (0.84, warm(0.2 * bright), None),
            (1, "#070605", None),
        ])
        parts.append(f'<g transform="rotate(-8 {cx:.1f} {base:.1f})">')
        rect(cx - sw_ / 2, base - h_, sw_, h_, fill, 0.97, f' rx="{sw_ * 0.24:.1f}"')
        path(f"M {cx - sw_ / 2 + 1:.1f} {base - h_ + 5:.1f} L {cx + sw_ / 2 - 1:.1f} {base - h_ + 5:.1f}", stroke="#e2c08a", sw=1, opacity=0.1 * bright + 0.03)
        parts.append("</g>")
        scroll_roll(x + width * 0.22, base - height * 0.12, width * 0.5, height * 0.19, bright, seed * 10, 2)

    else:  # two record boxes
        for i in range(2):
            bw = width * (0.44 - i * 0.04)
            bh = height * (0.34 + i * 0.08)
            bx = x + (i - 0.5) * width * 0.46
            rect(bx - bw / 2, base - bh, bw, bh, warm(0.15 * bright), 0.97, ' rx="2"')
            path(f"M {bx - bw / 2 + 2:.1f} {base - bh + 2:.1f} L {bx + bw / 2 - 2:.1f} {base - bh + 2:.1f}", stroke="#a17c48", sw=0.8, opacity=0.1 * bright + 0.02)
            path(f"M {bx - bw / 2 + 4:.1f} {base - bh + 9:.1f} L {bx + bw / 2 - 4:.1f} {base - bh + 9:.1f}", stroke="#0a0806", sw=1.2, opacity=0.45)


def shelf_wall(side, rnd):
    wall_fill = WALL_L if side == "left" else WALL_R
    poly(
        [(0, 0) if side == "left" else (2560, 0),
         (660, 240) if side == "left" else (1900, 240),
         (660, 1020) if side == "left" else (1900, 1020),
         (0, H) if side == "left" else (2560, H)],
        wall_fill,
    )

    rows = [292, 424, 556, 688, 820, 952]
    gap = rows[1] - rows[0]
    cols = [0.06, 0.23, 0.4, 0.57, 0.74, 0.9, 1.0]

    # shadow bay behind the shelving
    x0, x1 = wall_x(0.02, side), wall_x(1.0, side)
    poly(
        [(x0, scale_y(250, 0.02)), (x1, 250), (x1, 1016), (x0, scale_y(1016, 0.02))],
        "#070808",
        0.68,
    )

    # far half is softened (depth of field)
    lx, ly = (262.0, 344.0) if side == "left" else (2294.0, 424.0)
    for row_index, yb in enumerate(rows):
        t0, t1 = 0.02, 1.0
        xa, xb = wall_x(t0, side), wall_x(t1, side)
        ya, yb_y = scale_y(yb, t0), yb
        board_light = falloff((xa + xb) / 2, (ya + yb_y) / 2, lx, ly, 1100)
        th0 = 24 * (1 + (1 - t0) * 0.5)
        th1 = 13
        poly(
            [(xa, ya), (xb, yb_y), (xb, yb_y + th1), (xa, ya + th0)],
            lin(f"board{side}{row_index}", (xa, 0), (xb, 0), [
                (0, warm(0.3 * board_light), None),
                (0.45, warm(0.19 * board_light), None),
                (1, warm(0.1 * board_light), None),
            ]),
            0.97,
        )
        path(f"M {xa:.1f} {ya - 1.4:.1f} L {xb:.1f} {yb_y - 1.4:.1f}", stroke="#8a6537", sw=1.5, opacity=0.08 + 0.2 * board_light)
        path(f"M {xa:.1f} {ya + th0:.1f} L {xb:.1f} {yb_y + th1:.1f}", stroke="#000000", sw=2.2, opacity=0.55)

        if row_index == len(rows) - 1:
            continue

        for t in cols:
            x = wall_x(t, side)
            top = scale_y(yb, t)
            bot = scale_y(rows[row_index + 1], t)
            path(f"M {x:.1f} {top:.1f} L {x:.1f} {bot:.1f}", stroke="#090806", sw=5.4 * (1 + (1 - t)), opacity=0.92)

        for ci in range(len(cols) - 1):
            ta, tb = cols[ci] + 0.02, cols[ci + 1] - 0.02
            for k in range(2):
                t = ta + (tb - ta) * (0.25 + 0.5 * k + 0.08 * rnd.random())
                x = wall_x(t, side)
                base = scale_y(yb, t) - 2
                s = 1 + (1 - t) * 1.1
                cw = (tb - ta) * 660 * 0.62 * s
                ch = gap * (0.6 + 0.1 * rnd.random()) * s
                bright = falloff(x, base, lx, ly, 860) * 0.72
                cubby_items(rnd, x, base, cw, ch, ci * 3 + k + row_index, bright, 0.55)
                # record shadow on the shelf
                ell = rad(f"ash{side}{row_index}{ci}{k}", (x, base + 2), cw, [
                    (0, "rgba(0,0,0,0.6)", None),
                    (1, "rgba(0,0,0,0)", None),
                ])
                parts.append(f'<ellipse cx="{x:.1f}" cy="{base + 2:.1f}" rx="{cw * 0.55:.1f}" ry="5" fill="{ell}" opacity="0.7"/>')

    # outer upright frame, catching the edge light
    t = 0.025
    x = wall_x(t, side)
    xs = 1 if side == "left" else -1
    poly(
        [(x, scale_y(240, t)), (x + xs * 30, scale_y(240, t)),
         (x + xs * 30, scale_y(1020, t)), (x, scale_y(1020, t))],
        "#0e0b08",
        0.95,
    )
    path(
        f"M {x + xs * 6:.1f} {scale_y(240, t):.1f} L {x + xs * 6:.1f} {scale_y(1020, t):.1f}",
        stroke="#8a6537",
        sw=2,
        opacity=0.18,
    )
    # crown moulding
    poly([(x, scale_y(240, t)), (x + xs * 36, scale_y(240, t)),
          (x + xs * 36, scale_y(240, t) + 12), (x, scale_y(240, t) + 16)], "#2a2015", 0.95)


# --- floor -----------------------------------------------------------------
def floor():
    poly([(0, H), (660, 1020), (1900, 1020), (2560, H)], FLOOR)

    # stone joints in perspective
    for i in range(1, 10):
        t = i / 10
        y = VY + (1020 - VY) * (1 + (1 - t) * 2.8)
        if y > H:
            continue
        path(f"M 0 {y:.1f} L 2560 {y:.1f}", stroke="#000000", sw=2.2, opacity=0.38)
        path(f"M 0 {y + 3:.1f} L 2560 {y + 3:.1f}", stroke="#5e4a2f", sw=1, opacity=0.055)
    for i in range(-5, 6):
        x = VX + i * 264
        path(f"M {x} {H} L {VX + i * 42} 1020", stroke="#000000", sw=2.6, opacity=0.34)
        path(f"M {x + 2} {H} L {VX + i * 42 + 2} 1020", stroke="#5e4a2f", sw=1, opacity=0.045)

    # pools of lantern light on the stone
    for cx, rx, ry, op in ((300, 250, 96, 0.2), (2286, 220, 86, 0.16), (2360, 130, 48, 0.08)):
        g = rad(f"pool{cx}", (cx, 1052), max(rx, ry), [
            (0, f"rgba(255,192,116,{op})", None),
            (0.42, f"rgba(252,172,92,{op * 0.34:.3f})", None),
            (1, "rgba(252,172,92,0)", None),
        ])
        parts.append(f'<ellipse cx="{cx}" cy="1052" rx="{rx}" ry="{ry}" fill="{g}"/>')

    # long soft reflection streaks
    for cx, w, op in ((300, 120, 0.1), (2286, 90, 0.08)):
        g = lin(f"streak{cx}", (cx, 1040), (cx, 1400), [
            (0, f"rgba(255,196,120,{op})", None),
            (0.55, f"rgba(255,180,100,{op * 0.3:.3f})", None),
            (1, "rgba(255,180,100,0)", None),
        ])
        poly([(cx - w / 2, 1040), (cx + w / 2, 1040), (cx + w * 0.9, 1400), (cx - w * 0.9, 1400)], g)


# --- furniture silhouettes -------------------------------------------------
def furniture():
    # low reading cabinet, left foreground
    poly([(40, 1082), (470, 1036), (470, 1284), (40, 1352)], "#080907", 0.97)
    poly([(40, 1082), (470, 1036), (470, 1058), (40, 1106)], "#1e1710", 0.97)
    path("M 44 1086 L 466 1042", stroke="#9a7140", sw=1.7, opacity=0.2)
    for i in range(3):
        y = 1118 + i * 74
        path(f"M 58 {y} L 452 {y - 44}", stroke="#000000", sw=2, opacity=0.55)
        path(f"M 58 {y + 3} L 452 {y - 41}", stroke="#6b4c2a", sw=0.9, opacity=0.08)
    # stacks of ledgers
    for (x, y, w, h) in ((112, 1030, 100, 22), (132, 1007, 84, 20), (296, 1002, 88, 24), (318, 980, 70, 20)):
        rect(x, y, w, h, "#191410", 0.94, ' rx="2"')
        path(f"M {x} {y + 1} L {x + w} {y - 2}", stroke="#c9a35f", sw=1, opacity=0.15)
        path(f"M {x + 20} {y} L {x + 20} {y + h}", stroke="#0a0806", sw=2, opacity=0.5)

    # central low desk in the vault
    poly([(1004, 1128), (1716, 1128), (1782, 1236), (938, 1236)], "#0a0b09", 0.94)
    path("M 1004 1130 L 1716 1130", stroke="#8a6537", sw=1.7, opacity=0.16)
    path("M 938 1234 L 1782 1234", stroke="#000000", sw=3, opacity=0.55)
    # scroll on the desk
    poly([(1084, 1128), (1436, 1128), (1482, 1158), (1040, 1158)], "#2e271c", 0.6)
    path("M 1064 1140 L 1452 1140", stroke=GOLD, sw=0.9, opacity=0.12)
    # inkstone + brush rest
    rect(1540, 1110, 58, 20, "#131110", 0.94, ' rx="3"')
    rect(1554, 1104, 30, 7, "#0b0a09", 0.95, ' rx="2"')
    path("M 1548 1112 L 1600 1112", stroke="#e7d0a1", sw=0.8, opacity=0.1)

    # right-hand document trolley
    poly([(2060, 1076), (2358, 1106), (2358, 1318), (2060, 1268)], "#080907", 0.96)
    path("M 2060 1078 L 2358 1108", stroke="#8a6537", sw=1.3, opacity=0.13)
    for i in range(2):
        rect(2084, 1110 + i * 56, 250, 8, "#1a1510", 0.9, ' rx="2"')

    # leaning ladder against the right shelf
    lx, ly = 2140, 300
    for k in range(2):
        x = lx + k * 58
        path(f"M {x} {ly} L {x - 40} 1046", stroke="#100d09", sw=9, opacity=0.95)
        path(f"M {x + 5} {ly} L {x - 35} 1046", stroke="#6b4c2a", sw=1, opacity=0.1)
    for i in range(7):
        y = ly + 96 + i * 92
        xx = lx - (y - ly) * 0.13
        path(f"M {xx:.1f} {y:.1f} L {xx + 62:.1f} {y - 6:.1f}", stroke="#0d0b08", sw=6, opacity=0.95)
        path(f"M {xx + 2:.1f} {y + 2:.1f} L {xx + 60:.1f} {y - 4:.1f}", stroke="#7a5832", sw=0.9, opacity=0.1)

    # foreground out-of-focus frame: near shelf edge, left and right
    for side in ("left", "right"):
        xs = 1 if side == "left" else -1
        base_x = 0 if side == "left" else 2560
        poly([(base_x, 1000), (base_x + xs * 78, 1024), (base_x + xs * 78, H), (base_x, H)], "#050605", 0.95)

    # out-of-focus foreground uprights: depth framing at the extreme edges
    for side in ("left", "right"):
        xs = 1 if side == "left" else -1
        base_x = 0 if side == "left" else 2560
        g = lin(f"fgFrame{side}", (base_x, 0), (base_x + xs * 150, 0), [
            (0, "rgba(2,3,3,0.96)", None),
            (0.55, "rgba(2,3,3,0.55)", None),
            (1, "rgba(2,3,3,0)", None),
        ])
        poly([(base_x, 0), (base_x + xs * 150, 0), (base_x + xs * 150, H), (base_x, H)], g)
    # soft blurred shelf edge in the near foreground, bottom corners
    for cx, cy in ((120, 1240), (2440, 1240)):
        g = rad(f"fgBlur{cx}", (cx, cy), 360, [
            (0, "rgba(3,4,4,0.72)", None),
            (0.55, "rgba(3,4,4,0.32)", None),
            (1, "rgba(3,4,4,0)", None),
        ])
        parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="360" ry="300" fill="{g}" filter="{SOFT28}"/>')


# --- lanterns --------------------------------------------------------------
def lantern(cx, cy, w, h, strength=1.0, gid_seed=0):
    glow = rad(f"lglow{gid_seed}", (cx, cy), w * 3.6, [
        (0, f"rgba(255,196,120,{0.34 * strength:.2f})", None),
        (0.28, f"rgba(248,172,88,{0.13 * strength:.2f})", None),
        (0.62, f"rgba(230,144,66,{0.04 * strength:.3f})", None),
        (1, "rgba(230,144,66,0)", None),
    ])
    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{w * 3.6}" ry="{h * 2.8}" fill="{glow}"/>')

    # hanging rod + hook
    path(f"M {cx} {cy - h * 2.05} L {cx} {cy - h * 0.64}", stroke="#2f2214", sw=3)
    path(f"M {cx - 10} {cy - h * 2.05} L {cx + 10} {cy - h * 2.05}", stroke="#2f2214", sw=3)
    # caps
    rect(cx - w * 0.58, cy - h * 0.64, w * 1.16, h * 0.1, "#3a2a17", 0.95, ' rx="2"')
    # paper body with ribs
    body = lin(f"lbody{gid_seed}", (cx - w / 2, 0), (cx + w / 2, 0), [
        (0, "#5c3714", None),
        (0.16, "#c08338", None),
        (0.42, "#ffe3ae", None),
        (0.62, "#f0b467", None),
        (0.84, "#a86a2b", None),
        (1, "#4e2d10", None),
    ])
    rect(cx - w / 2, cy - h * 0.55, w, h * 1.1, body, 0.97, f' rx="{w * 0.09:.1f}"')
    for i in range(1, 6):
        y = cy - h * 0.55 + h * 1.1 * (i / 6)
        path(f"M {cx - w / 2:.1f} {y:.1f} L {cx + w / 2:.1f} {y:.1f}", stroke="#6b4218", sw=1.5, opacity=0.5)
    # flame core
    core = rad(f"lcore{gid_seed}", (cx, cy), w * 0.72, [
        (0, "rgba(255,247,222,0.9)", None),
        (0.42, "rgba(255,201,128,0.4)", None),
        (1, "rgba(255,180,90,0)", None),
    ])
    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{w * 0.72}" ry="{h * 0.55}" fill="{core}"/>')
    # base + finial
    rect(cx - w * 0.52, cy + h * 0.55, w * 1.04, h * 0.1, "#3a2a17", 0.95, ' rx="2"')
    path(f"M {cx} {cy + h * 0.65} L {cx} {cy + h * 0.78}", stroke="#2f2214", sw=2.4)
    # tassel
    path(f"M {cx} {cy + h * 0.78} q -6 20 2 34", stroke="#4a1515", sw=3, opacity=0.7)


# --- atmosphere ------------------------------------------------------------
def atmosphere():
    # warm volume around the lanterns
    hz = rad("hazeLeft", (300, 300), 980, [
        (0, "rgba(255,198,128,0.11)", None),
        (0.45, "rgba(248,176,96,0.036)", None),
        (1, "rgba(248,176,96,0)", None),
    ])
    rect(0, 0, 1300, 1080, hz)
    hz2 = rad("hazeRight", (2320, 430), 820, [
        (0, "rgba(255,192,120,0.1)", None),
        (0.5, "rgba(248,176,96,0.026)", None),
        (1, "rgba(248,176,96,0)", None),
    ])
    rect(1680, 0, 880, 1140, hz2)

    # cool haze in the vault so the room reads as air, not paint
    hz3 = lin("hazeCool", (0, 240), (0, 1020), [
        (0, "rgba(150,170,152,0.06)", None),
        (0.45, "rgba(126,146,132,0.022)", None),
        (1, "rgba(126,146,132,0)", None),
    ])
    rect(660, 240, 1240, 780, hz3)

    # dust caught in the shafts
    rnd = random.Random(64)
    for _ in range(120):
        x = rnd.uniform(30, 2530)
        y = rnd.uniform(250, 1330)
        r = rnd.uniform(0.7, 2.4)
        o = rnd.uniform(0.03, 0.13)
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#f8dcaa" opacity="{o:.3f}"/>')

    # low atmospheric fog rolling across the floor
    fog = lin("fogBand", (0, 760), (0, 1200), [
        (0, "rgba(198,196,176,0)", None),
        (0.34, "rgba(198,196,176,0.035)", None),
        (0.62, "rgba(206,198,172,0.055)", None),
        (1, "rgba(206,198,172,0)", None),
    ])
    rect(0, 760, W, 440, fog)
    fog2 = rad("fogFloor", (1280, 1080), 1100, [
        (0, "rgba(214,206,184,0.055)", None),
        (0.5, "rgba(206,198,172,0.02)", None),
        (1, "rgba(206,198,172,0)", None),
    ])
    parts.append(f'<ellipse cx="1280" cy="1080" rx="1100" ry="240" fill="{fog2}"/>')

    # heavy vignette
    vig = rad("vig", (1280, 700), 1520, [
        (0, "rgba(3,4,4,0)", None),
        (0.5, "rgba(3,4,4,0.14)", None),
        (0.8, "rgba(3,4,4,0.4)", None),
        (1, "rgba(3,4,4,0.74)", None),
    ])
    rect(0, 0, W, H, vig)

    # film grain
    defs.append(
        '<filter id="grain" x="0" y="0" width="100%" height="100%">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>'
        '<feColorMatrix type="saturate" values="0"/>'
        "</filter>"
    )
    parts.append(
        '<rect width="2560" height="1440" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:overlay"/>'
    )


# --- compose ---------------------------------------------------------------
rnd = random.Random(164)
poly([(0, 0), (W, 0), (W, H), (0, H)], BG)
ceiling()
rear_wall()
shelf_wall("left", rnd)
shelf_wall("right", rnd)
floor()
lantern(262, 344, 96, 154, 1.0, 1)
lantern(2294, 424, 76, 122, 0.9, 2)
lantern(2360, 1000, 24, 40, 0.42, 3)
furniture()
atmosphere()

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
    f"<defs>{''.join(defs)}</defs>{''.join(parts)}</svg>"
)

out = os.path.join("public", "assets", "experience", "career-archive-chamber-v3.svg")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(svg)
print(f"{out}: {len(svg) / 1024:.1f} KB")
