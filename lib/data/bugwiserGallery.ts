/**
 * Real screens from the deployed BugWiser application.
 *
 * Captured on 16 Nov 2026 from https://bug-wiser.vercel.app/ using the
 * application's own dark theme (switched with its "Toggle theme" control).
 * Each entry is a viewport capture of the live build, not recreated markup.
 *
 * Desktop captures are 1440×900. Mobile captures are 390×844 and are served
 * through `<picture>` art direction so the interface stays legible on a phone.
 *
 * Only add a screen that can be reproduced from the live application, and keep
 * the label tied to what the screen actually shows.
 */

export type BugWiserScreenImage = {
  src: string;
  width: number;
  height: number;
};

export type BugWiserScreen = {
  id: string;
  /** Short, factual label used by the controls and caption. */
  label: string;
  /** One factual line about what the screen shows. */
  caption: string;
  alt: string;
  desktop: BugWiserScreenImage;
  mobile: BugWiserScreenImage;
};

export const bugwiserScreens: BugWiserScreen[] = [
  {
    id: "overview",
    label: "Landing and entry point",
    caption: "The public landing screen and its Continue with GitHub action.",
    alt: "BugWiser landing screen with the headline 'Understand any GitHub issue faster', a Continue with GitHub button and a See how it works link",
    desktop: {
      src: "/assets/missions/bugwiser/screen-overview.png",
      width: 1440,
      height: 900,
    },
    mobile: {
      src: "/assets/missions/bugwiser/screen-overview-mobile.png",
      width: 390,
      height: 844,
    },
  },
  {
    id: "workflow",
    label: "Six-step workflow",
    caption: "How it works: connect repository, select issue, trace code, find root cause, generate patch, create branch and PR.",
    alt: "BugWiser how-it-works screen showing six steps: connect repository, select issue, trace code, find root cause, generate patch, and create branch and pull request",
    desktop: {
      src: "/assets/missions/bugwiser/screen-workflow.png",
      width: 1440,
      height: 900,
    },
    mobile: {
      src: "/assets/missions/bugwiser/screen-workflow-mobile.png",
      width: 390,
      height: 844,
    },
  },
  {
    id: "investigation",
    label: "Investigation workspace",
    caption: "Issue #402 with a 94% root-cause finding and a patch preview for src/core/thread-pool.ts.",
    alt: "BugWiser investigation workspace showing repository and issue context, a 94% root-cause analysis for a memory leak, and a highlighted patch preview for src/core/thread-pool.ts",
    desktop: {
      src: "/assets/missions/bugwiser/screen-investigation.png",
      width: 1440,
      height: 900,
    },
    mobile: {
      src: "/assets/missions/bugwiser/screen-investigation-mobile.png",
      width: 390,
      height: 844,
    },
  },
];
