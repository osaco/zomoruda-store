"use client";

import { useSyncExternalStore } from "react";

/** True after the first client render — avoids hydration mismatch with persisted cart. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
