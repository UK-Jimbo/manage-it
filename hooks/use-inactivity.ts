import { useEffect, useRef } from "react";

// Inactivity timeout in milliseconds
// Setting to 1 minute (60000ms) for testing purposes
export const INACTIVITY_TIMEOUT_MS = 60 * 1000;

export function useInactivity() {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Ensure we start fresh on mount
    lastActivityRef.current = Date.now();

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  return {
    getLastActivity: () => lastActivityRef.current,
    timeoutMs: INACTIVITY_TIMEOUT_MS,
  };
}
