import { getPilotIdentity } from "./pilot-auth.server";

const PUBLIC_PATHS = new Set(["/login", "/auth/login", "/health", "/robots.txt", "/favicon.ico"]);
function isInternalAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/assets/") || pathname.startsWith("/_") || pathname.startsWith("/brand/")
  );
}

export function protectPilotRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const { pathname } = url;

  if (PUBLIC_PATHS.has(pathname) || isInternalAsset(pathname) || pathname.startsWith("/api/"))
    return null;

  if (pathname === "/finance" && request.method === "GET") {
    if (!getPilotIdentity(request)) {
      if (request.headers.get("x-atlas-authenticated") === "true") {
        return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
      }
      const loginUrl = new URL("/login", url);
      loginUrl.searchParams.set("returnTo", "/finance");
      return Response.redirect(loginUrl, 302);
    }
    return null;
  }

  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}
