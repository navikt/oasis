import { IncomingMessage } from "http";
import { AuthProvider } from "./middleware";
import { apiToken } from "../issuers";

export interface User {
  sub: string;
}

export interface Session {
  user: User;
  expires_in: number;
  apiToken: (audience: string) => Promise<string | undefined>;
}

export interface CtxOrReq {
  req?: IncomingMessage;
  ctx?: { req: IncomingMessage };
}

/**
 * Helper for å hente session og helper for å hente nøkler for APIer bakover
 *
 * 1. API routes: getSession({ req })
 * 2. SSR data fetcher: getSession(context)
 */
export async function getSession(
  provider: AuthProvider,
  { ctx, req = ctx?.req }: CtxOrReq = {}
): Promise<Session> {
  const { authorization } = req!.headers;
  if (!authorization)
    throw new Error("No valid authorization header was found");

  try {
    const token = authorization.split(" ")[1];
    const { payload } = await provider.verifyToken(token);

    return {
      user: {
        sub: payload.sub as string,
      },
      expires_in: expiresIn(payload.exp!),
      apiToken: apiToken(provider, token),
    };
  } catch (err) {
    throw err;
  }
}

function expiresIn(timestamp: number): number {
  return timestamp - Math.round(Date.now() / 1000);
}
