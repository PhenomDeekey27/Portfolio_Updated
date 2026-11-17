# Scroll Interaction Design — Phase 2.1.1

## Goal
A cinematic but non-frustrating journey: each major section owns an environment, and moving between sections plays a Flying Raijin transition. Normal scrolling must remain usable.

## Principles
1. Never hijack the wheel. Lenis keeps smooth scrolling; no `preventDefault` on wheel/touch.
2. Transitions are triggered by section intersection, not by raw scroll deltas.
3. A cooldown (800 ms) prevents a single gesture from firing multiple transitions.
4. Reduced motion: instant swap, no blur/particles.
5. Touch: rely on native momentum scrolling; transitions fire on section enter, not on touch velocity.
6. Mobile (<1024px): no live 3D, poster only; transitions are simple fades.

## Section order
Hero -> About -> Skills -> Missions -> Experience -> Contact.

## Transition flow (Flying Raijin)
IDLE -> PREPARING -> KUNAI_APPEARING -> SEAL_ACTIVATION -> TELEPORTING -> WORLD_SWITCH -> REVEALING -> IDLE.

- PREPARING: current content fades, brief darken/blur.
- KUNAI_APPEARING: kunai scales in at centre.
- SEAL_ACTIVATION: golden chakra particles surround the kunai.
- TELEPORTING: flash/scanline.
- WORLD_SWITCH: swap the active world in the persistent canvas.
- REVEALING: next section content fades in, blur clears.

## Implementation notes
- The persistent canvas lives once (WorldHost) and is never destroyed/recreated; only the active world swaps.
- Section snapping is NOT forced. If snapping is added later, it must be tested for wheel/touch usability first.
- `useSectionTransition` (lib/scroll/sectionTransition.ts) gates requests with a cooldown and re-entrancy guard.
- `useFlyingRaijinTransition` (lib/transitions/flyingRaijin.ts) owns the state machine; visuals are deferred.

## Mobile / accessibility
- `prefers-reduced-motion: reduce` disables the live canvas and instant-swaps worlds.
- Canvas is `aria-hidden`, poster provides the no-JS/no-WebGL fallback.
- All CTAs remain normal HTML with pointer events unaffected.
