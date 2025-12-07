import { ensureSuperTokensInit } from "../../../../lib/auth/init";
import { NextRequest } from "next/server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

ensureSuperTokensInit();

export async function GET(request: NextRequest) {
    const res = await getAppDirRequestHandler()(request);
    return res;
}

export async function POST(request: NextRequest) {
    const res = await getAppDirRequestHandler()(request);
    return res;
}

export async function PUT(request: NextRequest) {
    const res = await getAppDirRequestHandler()(request);
    return res;
}

export async function DELETE(request: NextRequest) {
    const res = await getAppDirRequestHandler()(request);
    return res;
}
