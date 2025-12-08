"use client";

import { useEffect, useRef } from "react";
import Session from "supertokens-auth-react/recipe/session";

interface SessionExpiry {
  accessTokenExpiry: number | null;
  refreshTokenExpiry: number | null;
  timeCreated: number;
}

/**
 * Component that monitors session expiry and redirects to login when session expires
 * This ensures users are automatically logged out when their session times out
 */
export function SessionMonitor() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const redirectingRef = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      // Prevent multiple redirects
      if (redirectingRef.current) {
        return;
      }

      try {
        // First check if session exists using SuperTokens client
        const sessionExists = await Session.doesSessionExist();
        
        if (!sessionExists) {
          // No session, redirect to login
          redirectingRef.current = true;
          window.location.href = "/login";
          return;
        }

        // Check session expiry via API
        const response = await fetch("/api/session-expiry", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 500) {
          // Session expired or API error, redirect to login
          redirectingRef.current = true;
          window.location.href = "/login";
          return;
        }

        if (response.ok) {
          const data: SessionExpiry = await response.json();
          const now = Math.floor(Date.now() / 1000);

          // Check if refresh token has expired (this is the critical check)
          // If refresh token is expired, the session is completely invalid and user must re-login
          if (data.refreshTokenExpiry !== null && data.refreshTokenExpiry !== undefined && !isNaN(data.refreshTokenExpiry)) {
            const refreshTimeLeft = data.refreshTokenExpiry - now;
            if (refreshTimeLeft <= 0) {
              // Refresh token expired - session is completely invalid, redirect to login
              redirectingRef.current = true;
              window.location.href = "/login";
              return;
            }
          } else {
            // Can't determine refresh token expiry from API
            // Fallback: check if access token is expired and we have no refresh token info
            // This is a safety check in case the API doesn't return refresh token expiry
            if (data.accessTokenExpiry !== null && data.accessTokenExpiry !== undefined && !isNaN(data.accessTokenExpiry)) {
              const timeLeft = data.accessTokenExpiry - now;
              // If access token expired and we can't verify refresh token, be conservative and redirect
              if (timeLeft <= 0) {
                redirectingRef.current = true;
                window.location.href = "/login";
                return;
              }
            }
          }
        }
      } catch (error) {
        // If there's an error checking the session, it might be expired
        // Try to verify with SuperTokens client
        try {
          const sessionExists = await Session.doesSessionExist();
          if (!sessionExists) {
            redirectingRef.current = true;
            window.location.href = "/login";
          }
        } catch {
          // If we can't check, assume session is invalid and redirect
          redirectingRef.current = true;
          window.location.href = "/login";
        }
      }
    };

    // Check immediately
    checkSession();

    // Then check every second to catch expiration in real-time
    intervalRef.current = setInterval(checkSession, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
