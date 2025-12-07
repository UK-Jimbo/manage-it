import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionForServer } from "./lib/auth";

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/account")
  ) {
    // We can't use `getSessionForServer` directly in middleware because it uses `cookies()` which is for Server Components/Actions.
    // In middleware, we read cookies from `request.cookies`.
    // Also `supertokens-node` session verification in middleware is tricky because it might need to refresh tokens which requires writing to response.

    // For simplicity and robustness in App Router, we often check for the existence of the access token cookie.
    // If it's missing, we redirect. If it's present but invalid, the Server Component will handle the redirect (double check).
    // However, to be "secure", we should verify it.

    // SuperTokens provides `withSession` for middleware but it's for the Edge runtime which might not support all Node crypto.
    // Since we are running on "host" (Node.js), we might be okay.

    // BUT, `supertokens-node` is not edge compatible usually.
    // So we do a basic check here and let the Server Component do the heavy lifting / refreshing.

    const hasAccessToken = request.cookies.has("sAccessToken");
    if (!hasAccessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If we want to be stricter, we could try to verify, but without `supertokens-node` support in Edge (middleware runs on Edge by default in Vercel, but on Node in self-host usually if configured, but Next.js middleware is Edge-like).
    // Given the constraints and "safe defaults", checking cookie existence is a good first line of defense.
    // The Server Components inside /protected will do the actual `getSessionOrRedirect` which verifies the signature.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
