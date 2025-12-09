import { useEffect, useRef } from "react";

// Inactivity timeout in seconds (converted to ms internally)
// Read from environment variable in seconds, default to 30 minutes (1800 seconds)
export const INACTIVITY_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT || "1800",
  10
);

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
    timeout: INACTIVITY_TIMEOUT,
  };
}
