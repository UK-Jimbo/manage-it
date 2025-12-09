"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Session from "supertokens-auth-react/recipe/session";

interface TokenValidity {
  accessTokenValidity: string;
  refreshTokenValidity: string;
}

interface SessionExpiry {
  accessTokenExpiry: number | null;
  refreshTokenExpiry: number | null;
  timeCreated: number;
}

function formatTime(seconds: number | null): string {
  if (seconds === null || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const STORAGE_KEY_ACCESS_TOKEN_EXPIRY = "supertokens_access_token_expiry";
const STORAGE_KEY_REFRESH_TOKEN_EXPIRY = "supertokens_refresh_token_expiry";

// Load session creation time from localStorage synchronously
function loadNumberFromStorage(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const val = parseInt(stored, 10);
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }
  } catch (error) {
    console.warn(`Failed to load persisted ${key}:`, error);
  }
  return null;
}

export function TokenValidityDisplay() {
  const [validity, setValidity] = useState<TokenValidity | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Store session creation time (source of truth from SuperTokens)
  const [sessionCreated, setSessionCreated] = useState<number | null>(null);

  // Store refresh token expiry
  const [refreshTokenExpiry, setRefreshTokenExpiry] = useState<number | null>(
    typeof window !== "undefined"
      ? loadNumberFromStorage(STORAGE_KEY_REFRESH_TOKEN_EXPIRY)
      : null
  );

  // Load from localStorage on client mount (handles SSR case)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedRefreshExpiry = loadNumberFromStorage(
      STORAGE_KEY_REFRESH_TOKEN_EXPIRY
    );
    if (storedRefreshExpiry !== null) {
      setRefreshTokenExpiry(storedRefreshExpiry);
    }
  }, []);

  // Fetch configured validity values
  useEffect(() => {
    fetch("/api/token-validity")
      .then((res) => res.json())
      .then((data: TokenValidity) => {
        setValidity(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to defaults if API fails
        setValidity({
          accessTokenValidity: "900",
          refreshTokenValidity: "20160",
        });
        setLoading(false);
      });
  }, []);

  // Fetch session creation time from API
  useEffect(() => {
    if (!validity) return; // Wait for validity config to load

    let isActive = true;
    let healthCheckInterval: NodeJS.Timeout | null = null;

    const saveToStorage = (key: string, value: number | null) => {
      if (typeof window === "undefined") return;
      try {
        if (value !== null) {
          localStorage.setItem(key, value.toString());
        } else {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error);
      }
    };

    const fetchSessionCreated = async () => {
      if (!isActive) return;

      // First check if session exists on client side
      try {
        const sessionExists = await Session.doesSessionExist();
        if (!sessionExists) {
          setHasSession(false);
          return;
        }
      } catch {
        // If we can't check session, continue to API call
      }

      try {
        const response = await fetch("/api/session-expiry", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.ok) {
          const data: SessionExpiry = await response.json();
          if (!isActive) return;

          setHasSession(true); // Store session creation time
          if (data.timeCreated && data.timeCreated > 0) {
            setSessionCreated(data.timeCreated);
          }

          // Store refresh token expiry
          if (data.refreshTokenExpiry && data.refreshTokenExpiry > 0) {
            const currentStored = refreshTokenExpiry;
            const now = Math.floor(Date.now() / 1000);

            // Only update if we don't have a stored value, or if the stored value is in the past
            // This prevents the timer from resetting on page refresh if the session was extended
            if (currentStored === null || currentStored <= now) {
              setRefreshTokenExpiry(data.refreshTokenExpiry);
              saveToStorage(
                STORAGE_KEY_REFRESH_TOKEN_EXPIRY,
                data.refreshTokenExpiry
              );
            }
          }
        } else if (response.status === 401) {
          // No session confirmed by API - clear state
          if (!isActive) return;
          setHasSession(false);
          setSessionCreated(null);
          setRefreshTokenExpiry(null);
          saveToStorage(STORAGE_KEY_REFRESH_TOKEN_EXPIRY, null);
        }
      } catch (error) {
        console.error("Failed to fetch session expiry:", error);
      }
    };

    // Fetch immediately on mount
    fetchSessionCreated();

    // Health check: re-fetch every 30 seconds
    healthCheckInterval = setInterval(() => {
      fetchSessionCreated();
    }, 30000);

    return () => {
      isActive = false;
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [validity, refreshTokenExpiry]);

  // Calculate time left
  const [accessTokenTimeLeft, setAccessTokenTimeLeft] = useState<number | null>(
    null
  );
  const [refreshTokenTimeLeft, setRefreshTokenTimeLeft] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!hasSession || !validity) {
      setAccessTokenTimeLeft(null);
      setRefreshTokenTimeLeft(null);
      return;
    }

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeCreated = sessionCreated;
      const currentRefreshTokenExpiry = refreshTokenExpiry;

      if (timeCreated === null) {
        setAccessTokenTimeLeft(null);
        setRefreshTokenTimeLeft(null);
        return;
      }

      const accessTokenValidity = parseInt(
        validity.accessTokenValidity || "900",
        10
      );
      const refreshTokenValidity =
        parseInt(validity.refreshTokenValidity || "20160", 10) * 60; // Convert minutes to seconds

      // Calculate time since session creation
      const timeSinceCreation = now - timeCreated;

      // For access token: always use calculation to avoid reset on token refresh
      let accessTokenTimeLeftInCycle = 0;
      accessTokenTimeLeftInCycle =
      accessTokenValidity - (timeSinceCreation % accessTokenValidity);
      setAccessTokenTimeLeft(Math.max(0, accessTokenTimeLeftInCycle));

      // For refresh token: use actual expiry if available, else fallback to calculation
      let refreshTokenTimeLeftVal = 0;
      if (
        currentRefreshTokenExpiry !== null &&
        currentRefreshTokenExpiry > now
      ) {
        refreshTokenTimeLeftVal = currentRefreshTokenExpiry - now;
      } else if (
        currentRefreshTokenExpiry !== null &&
        currentRefreshTokenExpiry <= now
      ) {
        refreshTokenTimeLeftVal = 0;
      } else {
        // Fallback to calculation
        refreshTokenTimeLeftVal = refreshTokenValidity - timeSinceCreation;
      }
      setRefreshTokenTimeLeft(Math.max(0, refreshTokenTimeLeftVal));
    };

    // Update immediately
    updateTimeLeft();

    // Then update every second
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [hasSession, validity, sessionCreated, refreshTokenExpiry]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Timer (Testing Values)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const access = validity?.accessTokenValidity || "900";
  const refresh = validity?.refreshTokenValidity || "20160";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Timer (Testing Values)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Access Token Validity: {access} seconds
          </p>
          {hasSession && accessTokenTimeLeft !== null ? (
            <p
              className={`text-lg font-mono font-bold ${
                accessTokenTimeLeft <= 10
                  ? "text-red-500"
                  : accessTokenTimeLeft <= 30
                  ? "text-orange-500"
                  : ""
              }`}
            >
              Access Token Time Left: {formatTime(accessTokenTimeLeft)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No active session</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Refresh Token Validity: {refresh} minutes
          </p>
          {hasSession && refreshTokenTimeLeft !== null ? (
            <p
              className={`text-lg font-mono font-bold ${
                refreshTokenTimeLeft <= 30
                  ? "text-red-500"
                  : refreshTokenTimeLeft <= 60
                  ? "text-orange-500"
                  : ""
              }`}
            >
              Refresh Token Time Left: {formatTime(refreshTokenTimeLeft)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No active session</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
