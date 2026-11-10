import { useCallback, useSyncExternalStore } from "react";

/** Tracks a CSS media query. False during server rendering and where matchMedia is missing. */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (notify) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener?.("change", notify);
      return () => list.removeEventListener?.("change", notify);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false),
    () => false
  );
}
