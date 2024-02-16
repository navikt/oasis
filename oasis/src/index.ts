import { IncomingMessage } from "http";
import { decodeJwt } from "jose";
import { secondsUntil } from "./utils/secondsUntil";

export type SupportedRequestType = IncomingMessage | Request;

export type IdentityProvider = (
  req: SupportedRequestType,
) => Promise<string | null>;

export type OboProvider = (
  token: string,
  audience: string,
) => Promise<string | null>;

interface SessionBase {
  token: string;
  expiresIn: number;
}

interface SessionWithOboProvider extends SessionBase {
  apiToken: (audience: string) => Promise<string | null>;
}

type GetSession = (req: SupportedRequestType) => Promise<SessionBase | null>;

export type GetSessionWithOboProvider = (
  req: SupportedRequestType,
) => Promise<SessionWithOboProvider | null>;

export function makeSession(options: {
  identityProvider: IdentityProvider;
}): GetSession;

export function makeSession(options: {
  identityProvider: IdentityProvider;
  oboProvider: OboProvider;
}): GetSessionWithOboProvider;

export function makeSession({
  identityProvider,
  oboProvider,
}: {
  identityProvider: IdentityProvider;
  oboProvider?: OboProvider;
}): GetSession {
  return async (req) => {
    const token = await identityProvider(req);
    if (!token) return null;

    const payload = decodeJwt(token);
    const session = {
      token,
      expiresIn: secondsUntil(payload.exp ?? 0),
    };

    if (oboProvider) {
      return {
        ...session,
        apiToken: (audience) => oboProvider(token, audience),
      } satisfies SessionWithOboProvider;
    }
    return session;
  };
}

export { decodeJwt } from "jose";

export { getSession } from "./provider";
