# Phase 6.9 — ResQ audit

Audit completed before the rebuild, then updated after the privacy replacement.

## 1. Existing ResQ implementation (before this phase)

- `components/missions/LightningScene.tsx` rendered ResQ as a diagonal
  lightning encounter: a stand-in shinobi, chakra orb, arcs and a title wipe.
  It reused `MissionRecord` for the factual half.
- Project data lived in `lib/data/missions.ts` (`resq`, rank S, category
  “Hackathon Prototype · Android”, four stack entries, GitHub link only).
- There was no gallery, no release link and no ResQ-specific record.
- The scene could be replaced independently: only `components/Missions.tsx`
  referenced it, keyed on `mission.id === "resq"`. BugWiser, ENN and Saravaraj
  have their own scene components and were untouched.

## 2. Available screenshots

`public/assets/missions/resq/screens/` (813 × 1759 unless noted):

| File | What it actually shows | Source |
| --- | --- | --- |
| `resq-home-light.png` | Protected home, light theme, shield ring, sensor rows, Pause Protection | Design PDF p1 |
| `resq-home-dark.png` | Same screen, dark theme | Design PDF p2 |
| `resq-settings-light.png` | Settings list: appearance, protection, emergency, permissions | Design PDF p3 |
| `resq-settings-dark.png` | Same settings structure, dark theme | Design PDF p4 |
| `resq-test-mode.png` | Debug/test mode: sensors, fix, detection state, confidence, simulations, build/model rows | Design PDF p5 |
| `resq-accident-detected.png` | “Are you okay?”, large countdown, cancel and “I need help now” | Design PDF p6 |
| `resq-emergency-active.png` | Emergency active, shared location, nearest hospitals, Call 112 | Design PDF p7 |
| `resq-location-unavailable.png` | Location unavailable, last-known age, limited hospitals, Enable Location | Design PDF p8 |
| `resq-hospital-details.png` | Hospital name, distance, address, phone, Call Hospital, Directions | Design PDF p9 |
| `resq-page10.png` | Logo and identity variations (2500 × 1167) | Design PDF p10 |

All ten are design-system mockups. None has a device status bar or system
chrome, so none is a screenshot of the installed application.

## 3. What was missing

- No genuine, privacy-safe capture of the released APK.
- No screenshot of the build's own resource-search results or its “location is
  out of date” state.
- No Android SDK, platform tools, emulator or AVD is installed on this machine,
  so the release APK could not be installed and captured here.

## 4. Privacy findings

The interrupted pass had extracted eleven frames from the author's device
recording into `public/assets/missions/resq/live/`. Two of them showed a saved
contact's name and number, and several showed real coordinates and real nearby
providers. Those files and their evidence screenshots were removed in this
phase. The PDF screens above contain only generic demonstration content and are
the only images now used.

## 5. Replacement safety

`components/Missions.tsx` maps `resq` to `WindReleaseScene`; no other project
imports the ResQ gallery or record. The new components are self-contained under
`wnd-*` class names, so the sand, seal and network scenes are unaffected.
