import { getSessionForServer } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session } = await getSessionForServer();

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Read token validity from env vars
    const accessTokenValidity = parseInt(
      process.env.ACCESS_TOKEN_VALIDITY || "900",
      10
    );
    const refreshTokenValidity =
      parseInt(process.env.REFRESH_TOKEN_VALIDITY || "20160", 10) * 60; // Convert minutes to seconds
    // Get session creation time
    const timeCreated = await session.getTimeCreated();

    const now = Math.floor(Date.now() / 1000);

    // SuperTokens getTimeCreated() returns Unix timestamp in seconds
    let timeCreatedSeconds: number;
    if (typeof timeCreated === "number") {
      // If it's larger than 1e10, it's likely in milliseconds
      timeCreatedSeconds =
        timeCreated > 1e10 ? Math.floor(timeCreated / 1000) : timeCreated;
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
    if (accessTokenExpiry && !isNaN(accessTokenExpiry)) {
      validAccessTokenExpiry = accessTokenExpiry;
    } else {
      // Fallback: current time + validity
      validAccessTokenExpiry = now + accessTokenValidity;
    }

    // Refresh token expiry should be within the validity period
    let validRefreshTokenExpiry: number | null = null;
    if (!isNaN(refreshTokenExpiry)) {
      // We trust the calculated expiry based on creation time
      validRefreshTokenExpiry = refreshTokenExpiry;
    } else {
      // Fallback: current time + validity
      validRefreshTokenExpiry = now + refreshTokenValidity * 60;
    }

    const validTimeCreated = !isNaN(timeCreatedSeconds)
      ? timeCreatedSeconds
      : now;

    return NextResponse.json({
      accessTokenExpiry: validAccessTokenExpiry,
      refreshTokenExpiry: validRefreshTokenExpiry,
      timeCreated: validTimeCreated,
    });
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error("Session expiry API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get session expiry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
