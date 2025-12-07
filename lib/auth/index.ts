import { ensureSuperTokensInit } from "./init";
import Session from "supertokens-node/recipe/session";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import { getUser } from "supertokens-node";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

ensureSuperTokensInit();

export type SessionPayload = {
  userId: string;
  userDataInAccessToken: unknown;
};

export async function getSessionForServer(): Promise<{
  session: Session.SessionContainer | undefined;
  hasToken: boolean;
  hasInvalidClaim: boolean;
}> {
  const cookieStore = await cookies();

  // Convert ReadonlyRequestCookies to a format SuperTokens expects if needed,
  // but for getSession, we usually pass the request object.
  // In App Router, we often use `getSession` from `supertokens-node/nextjs` or manually handle it.
  // However, `supertokens-node`'s `getSession` expects a request and response object usually.
  // For App Router Server Components, we use `Session.getSession` with a custom request wrapper
  // or use the helper if available.

  // Since we are in App Router, we need to extract tokens from cookies manually or use a helper.
  // SuperTokens Node SDK v16+ has better support, but often requires `supertokens-node/nextjs`.

  // Let's use the standard way for App Router:
  // We need to construct a minimal request object with cookies and headers.

  const req = {
    cookies: cookieStore.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {} as Record<string, string>),
    headers: Object.fromEntries((await headers()).entries()),
    method: "GET",
    originalUrl: "/",
    url: "/",
    query: {},
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await Session.getSession(req as any, {} as any, {
      sessionRequired: false,
    });
    return {
      session: session,
      hasToken: !!session,
      hasInvalidClaim: false, // Simplified for now
    };
  } catch (err) {
    if (Session.Error.isErrorFromSuperTokens(err)) {
      if (err.type === Session.Error.TRY_REFRESH_TOKEN) {
        return { session: undefined, hasToken: true, hasInvalidClaim: false };
      } else if (err.type === Session.Error.UNAUTHORISED) {
        return { session: undefined, hasToken: false, hasInvalidClaim: false };
      }
    }
    throw err;
  }
}

export async function getSessionOrRedirect() {
  const { session } = await getSessionForServer();
  if (!session) {
    // If we have a token but it needs refresh, middleware should handle it or client side.
    // For server components, if we can't get a session, we redirect.
    redirect("/login");
  }
  return session;
}

export async function getUserMetadata(userId: string) {
  const { metadata } = await UserMetadata.getUserMetadata(userId);
  return metadata;
}

export async function getUserFromSession() {
  const session = await getSessionOrRedirect();
  const userId = session.getUserId();
  const user = await getUser(userId);
  const metadata = await getUserMetadata(userId);
  return { userId, metadata, user };
}
