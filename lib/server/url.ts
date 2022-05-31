import { NextRequest } from "next/server";

export function isAPI(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/api");
}

export function isEnforcedPath(
  req: NextRequest,
  notEnforcedPaths: string[]
): boolean {
  const { pathname } = req.nextUrl;

  if (pathname == "/" && notEnforcedPaths.includes(pathname)) return false;
  return !notEnforcedPaths
    .filter((path) => path !== "/")
    .some((notEnforcedPath) => pathname.startsWith(notEnforcedPath));
}
