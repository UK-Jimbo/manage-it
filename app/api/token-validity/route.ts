import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    accessTokenValidity: process.env.ACCESS_TOKEN_VALIDITY || "900",
    refreshTokenValidity: process.env.REFRESH_TOKEN_VALIDITY || "20160",
  });
}
