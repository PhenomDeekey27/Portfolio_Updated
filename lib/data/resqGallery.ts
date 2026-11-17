/**
 * ResQ application interface designs from the supplied design-system PDF
 * (`ResQ — Emergency Safety App Design System`), extracted at 813×1759.
 *
 * These are DESIGN REFERENCES, not captures of the released APK. They contain
 * only generic demonstration content — no real names, personal phone numbers,
 * coordinates or addresses — and they are labelled as designs everywhere they
 * appear in the portfolio. The earlier device captures were removed because
 * they showed a real contact and a real location.
 *
 * Only screens that actually exist in the PDF are listed. Nothing here is
 * recreated or extended by hand.
 */

export type ResQScreenImage = {
  src: string;
  width: number;
  height: number;
};

export type ResQScreen = {
  id: string;
  /** Short, factual label used by the controls and caption. */
  label: string;
  /** One factual line about what the design shows. */
  caption: string;
  alt: string;
  image: ResQScreenImage;
  /** Page of the source design-system PDF. */
  page: number;
};

const SCREEN = { width: 813, height: 1759 } as const;

/** Screens shown in the floating deck, in product-story order. */
export const resqScreens: ResQScreen[] = [
  {
    id: "home-light",
    label: "Protected home · light",
    caption:
      "Protection status with motion sensors and location, in the light appearance.",
    alt: "ResQ design for the light home screen, showing the title You're protected, motion sensors active and location precise above a Pause Protection button",
    image: { src: "/assets/missions/resq/screens/resq-home-light.png", ...SCREEN },
    page: 1,
  },
  {
    id: "home-dark",
    label: "Protected home · dark",
    caption: "The same protection state in the dark appearance.",
    alt: "ResQ design for the dark home screen, showing You're protected, motion sensors active and location precise above a Pause Protection button",
    image: { src: "/assets/missions/resq/screens/resq-home-dark.png", ...SCREEN },
    page: 2,
  },
  {
    id: "test-mode",
    label: "Test mode",
    caption:
      "Sensor rate, location fix, detection state, confidence and simulation controls.",
    alt: "ResQ design for a debug test mode screen listing sensor rate, location fix, detection state and a prototype confidence figure above simulation controls for impact, fall and missing location",
    image: { src: "/assets/missions/resq/screens/resq-test-mode.png", ...SCREEN },
    page: 5,
  },
  {
    id: "accident-detected",
    label: "Possible accident detected",
    caption:
      "A countdown asks whether the user is okay, with cancel and help actions.",
    alt: "ResQ design for the accident alert screen with a Possible accident detected label, the heading Are you okay, a large countdown, and the actions I'm OK Cancel Alert and I Need Help Now",
    image: {
      src: "/assets/missions/resq/screens/resq-accident-detected.png",
      ...SCREEN,
    },
    page: 6,
  },
  {
    id: "emergency-active",
    label: "Emergency active",
    caption:
      "The emergency state, with a shared location and the nearest hospitals.",
    alt: "ResQ design for the emergency screen headed Help is being alerted, showing a shared location with an accuracy value, a nearest hospitals list and Call 112 and directions actions",
    image: {
      src: "/assets/missions/resq/screens/resq-emergency-active.png",
      ...SCREEN,
    },
    page: 7,
  },
  {
    id: "location-unavailable",
    label: "Location unavailable",
    caption:
      "The fallback state when no current position is available, keeping the call action.",
    alt: "ResQ design for the emergency screen headed Location is unavailable, showing a last known location age and limited nearby hospitals above Enable Location and Call 112 actions",
    image: {
      src: "/assets/missions/resq/screens/resq-location-unavailable.png",
      ...SCREEN,
    },
    page: 8,
  },
  {
    id: "hospital-details",
    label: "Hospital details",
    caption:
      "A hospital record with its address, phone, call and directions actions.",
    alt: "ResQ design for a hospital details screen showing a hospital name and distance, an address and phone row, and Call Hospital and Directions actions",
    image: {
      src: "/assets/missions/resq/screens/resq-hospital-details.png",
      ...SCREEN,
    },
    page: 9,
  },
  {
    id: "settings-light",
    label: "Settings · light",
    caption:
      "Appearance, protection, emergency and permission preferences.",
    alt: "ResQ design for the light settings screen listing appearance, protection, emergency, permission and developer sections with their current values",
    image: {
      src: "/assets/missions/resq/screens/resq-settings-light.png",
      ...SCREEN,
    },
    page: 3,
  },
  {
    id: "settings-dark",
    label: "Settings · dark",
    caption: "The settings structure in the dark appearance.",
    alt: "ResQ design for the dark settings screen listing appearance, protection, emergency and permission sections with the same structure as the light theme",
    image: {
      src: "/assets/missions/resq/screens/resq-settings-dark.png",
      ...SCREEN,
    },
    page: 4,
  },
];

/** Additional design pages used as insets inside the written record. */
export const resqRecordScreens = {
  homeLight: {
    ...SCREEN,
    src: "/assets/missions/resq/screens/resq-home-light.png",
    alt: "ResQ design for the light home screen showing the protection state and sensor rows",
    page: 1,
  },
  homeDark: {
    ...SCREEN,
    src: "/assets/missions/resq/screens/resq-home-dark.png",
    alt: "ResQ design for the dark home screen showing the protection state and sensor rows",
    page: 2,
  },
} as const;
