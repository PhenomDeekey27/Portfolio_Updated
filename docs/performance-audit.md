# Performance Audit — Phase 2.1.1

## Scope
Audit of the Next.js portfolio after Phase 2.1 (Hidden Leaf Village hero environment), focusing on scroll smoothness and render cost. No new environments, characters, or teleport animations were added.

## Findings (actual, code-derived)

### 1. Multiple always-on render loops
- `components/InteractiveBackground.tsx` runs a `requestAnimationFrame` loop for the entire page lifetime. It draws a radial gradient plus up to 100 particles, and for every particle iterates over all later particles (O(n^2), up to ~4,950 pair checks/frame) with a heavy expression in the inner loop. This is the single largest contributor to main-thread work during scroll.
- `components/CursorWrapper.tsx` -> `SplashCursor` runs a WebGL cursor effect across the whole page.
- `components/HeroCanvas.tsx` (legacy torus, 1,200 points) is no longer rendered by `Hero.tsx` but remains in the tree only if imported; confirmed unused.
- `components/SkillsCanvas.tsx` is unused (grep: only defined, never imported).
- The new Hidden Leaf canvas (`HiddenLeafWorld`) runs one R3F render loop on capable desktops.

### 2. Hidden Leaf scene cost
- Dust: 220 points -> reduced to 120 -> 60.
- Sky shader: 5-octave FBM x2 per pixel -> reduced to 4 octaves.
- Shadow map: 1536 -> 1024, bounds +/-62 -> +/-55, type switched from deprecated PCFSoft to PCFShadowMap (removes a console warning and a fallback path).
- `castShadow` was enabled on curbs, rocks, foundations, eave brackets, lantern caps and timber frames. Disabled on those; kept on walls, roofs, trees, lanterns and the Hokage building.
- DPR capped at 1.5 (already). Live world is gated to >=1024px and no reduced motion.

### 3. React / state
- `HiddenLeafStage` holds a single `liveWorld` boolean with proper media-query listeners and cleanup. No per-frame setState.
- `CameraController` mutates the camera inside `useFrame` via `state.camera` (no React state). Good.
- No unnecessary re-renders identified in the world modules beyond initial mount.

### 4. Listeners
- `CameraController` registers `pointermove`/`pointerleave` with cleanup. Good.
- `InteractiveBackground` registers resize/mousemove/touchmove with cleanup. touchmove was not passive originally; fixed to passive.
- Lenis runs its own rAF loop (expected).

### 5. CSS
- `mix-blend-mode: screen` full-screen canvas plus `backdrop-blur` on skill cards can be expensive on scroll. Left as-is; documented.

## Optimizations applied
- InteractiveBackground: particle count 100 -> 40, connection neighbourhood capped to 8, tab-visibility pause added, touchmove made passive.
- Hidden Leaf: dust 220 -> 60, Sky FBM 5 -> 4 octaves, shadow map 1536 -> 1024 with tighter frustum, `castShadow` removed from low-value meshes, PCFShadowMap.
- Terrain curbs and vegetation rocks no longer cast shadows.

## Measurements
- Headless Chrome (SwiftShader software renderer) reported ~3 FPS at 1440x950 before and after. This is a software-rendering floor and is not representative of GPU performance; it is useful only as a regression guard. No GPU was available in this environment, so hardware FPS / draw-call counts could not be measured here.
- TypeScript: pass. ESLint: pass. Production build: pass (compiled in ~3-4s).
- Bundle: home route prerendered as static content.

## Remaining known costs (deferred)
- SplashCursor WebGL effect runs globally; consider gating to desktop + pointer devices.
- SkillsCanvas uses drei `<Html>` (DOM-in-3D) which is expensive; component is currently unused.
- Persistent cross-section canvas and Flying Raijin transitions are architecture only in this milestone.
