import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { JWTVerifyResult } from "jose";
import { isAPI, isEnforcedPath } from "./url";

export type VerifyAuth = (
  token: string | Uint8Array
) => Promise<JWTVerifyResult>;
export type Redirect = (request: NextRequest) => NextResponse;
export type GetToken = (req: NextRequest) => string | null;

export type AuthProvider = {
  getToken: GetToken;
  verifyToken: VerifyAuth;
  redirect: Redirect;
};

export type AuthMiddlewareOptions = {
  notEnforcedPaths?: string[];
  enforceAuth?: boolean;
  provider: AuthProvider;
};

const defaultNotEnforcedPaths = ["/_next", "/api/isalive", "/api/isready"];

export default function createAuthMiddleware(
  options: AuthMiddlewareOptions
): NextMiddleware {
  const { enforceAuth, notEnforcedPaths, provider } = {
    enforceAuth: true,
    notEnforcedPaths: [],
    ...options,
  };
  const notEnforced = [...defaultNotEnforcedPaths, ...notEnforcedPaths];

  return async (req) => {
    if (!enforceAuth) return null;
    if (!isEnforcedPath(req, notEnforced)) return NextResponse.next();

    const response = await verifyAuth(req, provider);
    if (response.status == 307 && isAPI(req)) {
      return new NextResponse(null, { status: 401, headers: response.headers });
    }

    return response;
  };
}

export async function verifyAuth(
  req: NextRequest,
  provider: AuthProvider
): Promise<NextResponse> {
  const token = provider.getToken(req);
  if (!token) return provider.redirect(req);

  try {
    await provider.verifyToken(token);
    return NextResponse.next();
  } catch (err) {
    console.error(err);
    return provider.redirect(req);
  }
}
