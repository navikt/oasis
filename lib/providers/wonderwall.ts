import { NextRequest, NextResponse } from "next/server";

export function redirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  const params = new URLSearchParams({ redirect: req.nextUrl.href });
  url.pathname = "/oauth2/login";
  url.search = params.toString();
  return NextResponse.redirect(url);
}

export function getToken(req: NextRequest): string | null {
  const token = req.headers.get("authorization");
  if (!token) return token;
  return token.split(" ")[1];
}
