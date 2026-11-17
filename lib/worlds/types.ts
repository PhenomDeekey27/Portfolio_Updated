// World system types for the persistent immersive canvas.

export type WorldId =
  | "hidden-leaf"
  | "training-grounds"
  | "mission-archives"
  | "hokage-office"
  | "contact";

export interface WorldDefinition {
  id: WorldId;
  label: string;
  /** Whether a scene implementation exists for this world. */
  implemented: boolean;
}

export interface WorldController {
  current: WorldId;
  setWorld: (id: WorldId) => void;
  isTransitioning: boolean;
  beginTransition: (target: WorldId) => void;
  endTransition: () => void;
}
