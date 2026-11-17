import type { WorldDefinition, WorldId } from "./types";

export const WORLD_REGISTRY: Record<WorldId, WorldDefinition> = {
  "hidden-leaf": { id: "hidden-leaf", label: "Hidden Leaf Village", implemented: true },
  "training-grounds": { id: "training-grounds", label: "Training Grounds", implemented: false },
  "mission-archives": { id: "mission-archives", label: "Mission Archives", implemented: false },
  "hokage-office": { id: "hokage-office", label: "Hokage Office", implemented: false },
  contact: { id: "contact", label: "Contact Environment", implemented: false },
};

export const WORLD_IDS: WorldId[] = Object.keys(WORLD_REGISTRY) as WorldId[];
