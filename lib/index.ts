import { IncomingMessage } from "http";
import { decodeJwt } from "jose";
import { secondsUntil } from "./utils/secondsUntil";

export type SupportedRequestType = IncomingMessage | Request;

export type Token = string;
export type IdentityProvider = (
  req: SupportedRequestType,
) => Promise<Token | null>;
export type OboProvider = (
  token: string,
  audience: string,
) => Promise<string | null>;

interface SessionBase {
  token: string;
  expiresIn: number;
}

export interface SessionWithOboProvider extends SessionBase {
  apiToken: (audience: string) => Promise<string>;
}

export type Session = SessionBase | SessionWithOboProvider | null;

export type GetSession = (req: SupportedRequestType) => Promise<Session>;

export type GetSessionWithoutOboProvider = (
  req: SupportedRequestType,
) => Promise<SessionBase>;
export type GetSessionWithOboProvider = (
  req: SupportedRequestType,
) => Promise<SessionWithOboProvider>;

export interface MakeSessionWithoutOboProvider {
  identityProvider: IdentityProvider;
}

export interface MakeSessionWithOboProvider
  extends MakeSessionWithoutOboProvider {
  oboProvider?: OboProvider;
}

export function makeSession(
  options: MakeSessionWithoutOboProvider,
): GetSessionWithoutOboProvider;

export function makeSession(
  options: MakeSessionWithOboProvider,
): GetSessionWithOboProvider;
export function makeSession({
  identityProvider,
  oboProvider,
}: MakeSessionWithOboProvider): GetSession {
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
      };
    }
    return session;
  };
}

export { decodeJwt } from "jose";
