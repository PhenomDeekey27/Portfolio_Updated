"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WorldId } from "@/lib/worlds/types";
import { WORLD_REGISTRY } from "@/lib/worlds/registry";
import HiddenLeafWorld from "@/components/worlds/HiddenLeafWorld/HiddenLeafWorld";

interface WorldContextValue {
  current: WorldId;
  setWorld: (id: WorldId) => void;
  isTransitioning: boolean;
  beginTransition: (target: WorldId) => void;
  endTransition: () => void;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<WorldId>("hidden-leaf");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setWorld = useCallback((id: WorldId) => {
    if (WORLD_REGISTRY[id]?.implemented) {
      setCurrent(id);
    }
  }, []);

  const beginTransition = useCallback((target: WorldId) => {
    if (!WORLD_REGISTRY[target]?.implemented) return;
    setIsTransitioning(true);
    setCurrent(target);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const value = useMemo<WorldContextValue>(
    () => ({ current, setWorld, isTransitioning, beginTransition, endTransition }),
    [current, setWorld, isTransitioning, beginTransition, endTransition]
  );

  return (
    <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
  );
}

export function useWorld(): WorldContextValue {
  const ctx = useContext(WorldContext);
  if (!ctx) {
    throw new Error("useWorld must be used within a WorldProvider");
  }
  return ctx;
}

/**
 * Persistent host for the immersive canvas. A single canvas instance is kept
 * alive and the active world is swapped inside it, avoiding destroy/recreate.
 */
export function WorldHost() {
  const { current } = useWorld();

  // Only the implemented worlds render a live scene; others fall back to a
  // neutral backdrop until their scenes are built in later phases.
  if (current === "hidden-leaf") {
    return <HiddenLeafWorld />;
  }

  return (
    <div
      aria-hidden="true"
      className="h-full w-full bg-[radial-gradient(ellipse_at_50%_40%,#121a26_0%,#070809_70%)]"
    />
  );
}
