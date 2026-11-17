/**
 * PHASE 6.12 — environment reuse guard.
 *
 * Runs before `next build` (and as `npm run validate:worlds`).
 *
 * Runtime guards in `lib/worlds/environments.ts` only cover what the registry
 * itself contains; they cannot catch a component or a CSS rule that hard-codes
 * *another* section's plate. That is exactly how a section ends up inheriting
 * an environment it does not own (the Skills plate surfacing in the Missions
 * area, for example).
 *
 * So: every approved environment plate may only be referenced from the
 * registry. If a plate filename appears anywhere else in the app source, the
 * build fails with the offending file and line.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const SKIP_DIRS = new Set(["node_modules", ".next", "screenshots", "public", "docs", "scripts"]);
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".css", ".mjs"];

/** Mirrors SECTION_ENVIRONMENTS in lib/worlds/environments.ts. */
const PLATES = [
  "hidden-leaf-village.jpg",
  "valley-of-the-end-wide.png",
  "skills-training-grounds-cinematic.png",
  "mission-hq-cinematic-v3.png",
  "career-archive-chamber-v3.webp",
];

const REGISTRY = join("lib", "worlds", "environments.ts");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) files.push(full);
  }
  return files;
}

const violations = [];
let scanned = 0;

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).split(sep).join("/");
    if (rel === REGISTRY.split(sep).join("/")) continue;
    const source = readFileSync(file, "utf8");
    scanned += 1;
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const plate of PLATES) {
        if (!line.includes(plate)) continue;
        violations.push({
          file: rel,
          line: index + 1,
          plate,
          text: line.trim().slice(0, 120),
        });
      }
    });
  }
}

if (violations.length > 0) {
  console.error("\n✗ Environment plate referenced outside the registry:\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.plate}`);
    console.error(`    ${v.text}\n`);
  }
  console.error(
    "  Section plates must be resolved through lib/worlds/environments.ts\n" +
      "  (getSectionEnvironment) so no section can paint another's environment.\n"
  );
  process.exit(1);
}

console.log(
  `✓ worlds: ${PLATES.length} unique environment plates, ${scanned} source files scanned, no cross-section reuse.`
);
