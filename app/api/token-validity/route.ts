import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return NextResponse.json({
      accessTokenValidity: config.accessTokenValidity,
      refreshTokenValidity: config.refreshTokenValidity,
    });
  } catch (error) {
    // Fallback to env vars if file not found
    return NextResponse.json({
      accessTokenValidity:
        process.env.NEXT_PUBLIC_ACCESS_TOKEN_VALIDITY || "60",
      refreshTokenValidity:
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_VALIDITY || "300",
    });
  }
}
