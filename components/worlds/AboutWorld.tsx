"use client";

import ValleyOfTheEnd from "./ValleyOfTheEnd";

interface Props {
  revealed?: boolean;
}

/**
 * About section environment — Valley of the End.
 *
 * Renders the original panoramic Valley of the End landscape as a full-bleed
 * background behind the complete About section. Two opposing shinobi
 * monuments flank a central waterfall, with mountains, forest and mist
 * establishing environmental depth. Restrained navy overlays integrate the
 * content with the landscape without hiding it.
 *
 * No WebGL canvas, no per-frame React state, no image decode during the
 * teleportation transition. The `revealed` prop gates opacity so the
 * background appears at WORLD_SWITCH (background first, then text).
 *
 * Note: the background image is an original generated asset — it is NOT the
 * JMARTZ504 Sketchfab model, so no CC BY attribution is shown here.
 */
export default function AboutWorld({ revealed = true }: Props) {
  return (
    <div
      aria-hidden="true"
      data-about-world
      className="pointer-events-none absolute inset-0 overflow-clip bg-[#07111F]"
    >
      <ValleyOfTheEnd revealed={revealed} />
    </div>
  );
}
