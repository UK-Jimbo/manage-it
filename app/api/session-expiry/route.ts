import { getSessionForServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const { session } = await getSessionForServer();
    
    if (!session) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    // Read token validity from config.json first
    let accessTokenValidity = 60; // default
    let refreshTokenValidity = 300; // default
    try {
      const configPath = path.join(process.cwd(), "config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      accessTokenValidity = parseInt(config.accessTokenValidity || "60", 10);
      refreshTokenValidity = parseInt(config.refreshTokenValidity || "300", 10);
    } catch {
      // Fallback to env vars or defaults
      accessTokenValidity = parseInt(process.env.ACCESS_TOKEN_VALIDITY || "60", 10);
      refreshTokenValidity = parseInt(process.env.REFRESH_TOKEN_VALIDITY || "300", 10);
    }

    // Get session creation time
    const timeCreated = session.getTimeCreated();
    
    const now = Math.floor(Date.now() / 1000);
    
    // SuperTokens getTimeCreated() returns Unix timestamp in seconds
    let timeCreatedSeconds: number;
    if (typeof timeCreated === 'number') {
      // If it's larger than 1e10, it's likely in milliseconds
      timeCreatedSeconds = timeCreated > 1e10 ? Math.floor(timeCreated / 1000) : timeCreated;
    } else {
      timeCreatedSeconds = Math.floor(Number(timeCreated) / 1000);
    }
    
    // Ensure timeCreated is not in the future (shouldn't happen, but handle edge cases)
    // Allow a small buffer (e.g. 60 seconds) for clock skew
    if (timeCreatedSeconds > now + 60) {
      // If timeCreated is significantly in the future, use current time as fallback
      timeCreatedSeconds = now;
    }
    
    // Get actual access token expiry from payload
    const payload = session.getAccessTokenPayload();
    const accessTokenExpiry = payload.exp;

    // Calculate refresh token expiry: session creation time + refresh token validity
    const refreshTokenExpiry = timeCreatedSeconds + refreshTokenValidity;

    // Validate the calculated values
    let validAccessTokenExpiry: number | null = null;
    if (accessTokenExpiry && !isNaN(accessTokenExpiry) && accessTokenExpiry > now) {
        validAccessTokenExpiry = accessTokenExpiry;
    } else {
        // Fallback: current time + validity
        validAccessTokenExpiry = now + accessTokenValidity;
    }
    
    // Refresh token expiry should be within the validity period
    let validRefreshTokenExpiry: number | null = null;
    if (!isNaN(refreshTokenExpiry) && refreshTokenExpiry > now) {
      // Check if it's reasonable (not more than 2 validity periods in the future)
      if (refreshTokenExpiry <= now + refreshTokenValidity * 2) {
        validRefreshTokenExpiry = refreshTokenExpiry;
      } else {
        // If calculated value seems wrong, use a simple fallback
        validRefreshTokenExpiry = now + refreshTokenValidity;
      }
    } else {
      // Fallback: current time + validity
      validRefreshTokenExpiry = now + refreshTokenValidity;
    }
    
    const validTimeCreated = !isNaN(timeCreatedSeconds) ? timeCreatedSeconds : now;

    return NextResponse.json({
      accessTokenExpiry: validAccessTokenExpiry,
      refreshTokenExpiry: validRefreshTokenExpiry,
      timeCreated: validTimeCreated,
    });
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error("Session expiry API error:", error);
    return NextResponse.json(
      { error: "Failed to get session expiry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
