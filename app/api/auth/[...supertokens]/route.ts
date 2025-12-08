import { ensureSuperTokensInit } from "../../../../lib/auth/init";
import { NextRequest, NextResponse } from "next/server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

ensureSuperTokensInit();

async function handleRequest(request: NextRequest) {
    try {
        const handler = getAppDirRequestHandler();
        const res = await handler(request);
        return res;
    } catch (error) {
        // Catch errors (e.g., "No SuperTokens core available to query")
        // and return a proper response instead of letting it propagate
        // This prevents the error from being logged to the terminal as an unhandled exception
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (
                message.includes("no supertokens core available") ||
                message.includes("supertokens core available to query") ||
                message.includes("supertokens core")
            ) {
                // Return a 500 response that the client can handle gracefully
                // This prevents Next.js from logging it as an unhandled error
                return NextResponse.json(
                    {
                        message:
                            "Authentication service is currently unavailable. Please try again later.",
                    },
                    { status: 500 }
                );
            }
        }
        // For other errors, re-throw to let Next.js handle them normally
        throw error;
    }
}

export async function GET(request: NextRequest) {
    return handleRequest(request);
}

export async function POST(request: NextRequest) {
    return handleRequest(request);
}

export async function PUT(request: NextRequest) {
    return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
    return handleRequest(request);
}
