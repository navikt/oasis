import { IncomingMessage } from "http";
import { decodeJwt } from "jose";
import { secondsUntil } from "./utils/secondsUntil";

export type SupportedRequestType = IncomingMessage | Request;

export type Token = string;

export type IdentityProvider = (
  req: SupportedRequestType,
) => Promise<Token | null>;

export type CustomIdentityProvider<Arg> = (arg: Arg) => Promise<Token | null>;

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

export type GetSession<Arg> = (reqOrArg: Arg) => Promise<Session>;

export type GetSessionWithoutOboProvider = (
  req: SupportedRequestType,
) => Promise<SessionBase>;

export type GetSessionWithOboProvider = (
  req: SupportedRequestType,
) => Promise<SessionWithOboProvider>;

export type GetCustomSessionWithoutOboProvider<Arg> = (
  arg: Arg,
) => Promise<SessionBase>;

export type GetCustomSessionWithOboProvider<Arg> = (
  arg: Arg,
) => Promise<SessionWithOboProvider>;

export interface MakeSessionWithoutOboProvider {
  identityProvider: IdentityProvider;
}

export interface MakeSessionWithOboProvider
  extends MakeSessionWithoutOboProvider {
  oboProvider: OboProvider;
}

export interface MakeSessionWithCustomIdentityProviderWithoutOboProvider<Arg> {
  identityProvider: CustomIdentityProvider<Arg>;
}

export interface MakeSessionWithCustomIdentityProviderWithOboProvider<Arg>
  extends MakeSessionWithCustomIdentityProviderWithoutOboProvider<Arg> {
  oboProvider: OboProvider;
}

export function makeSession(
  options: MakeSessionWithoutOboProvider,
): GetSessionWithoutOboProvider;

export function makeSession(
  options: MakeSessionWithOboProvider,
): GetSessionWithOboProvider;

export function makeSession<Arg>(
  options: MakeSessionWithCustomIdentityProviderWithoutOboProvider<Arg>,
): GetCustomSessionWithoutOboProvider<Arg>;

export function makeSession<Arg>(
  options: MakeSessionWithCustomIdentityProviderWithOboProvider<Arg>,
): GetCustomSessionWithOboProvider<Arg>;

export function makeSession<Arg>(
  opts:
    | MakeSessionWithCustomIdentityProviderWithOboProvider<Arg>
    | MakeSessionWithCustomIdentityProviderWithoutOboProvider<Arg>,
): GetSession<Arg> {
  return async (reqOrArg: Arg) => {
    const token = await opts.identityProvider(reqOrArg);
    if (!token) return null;

    const payload = decodeJwt(token);
    const session = {
      token,
      expiresIn: secondsUntil(payload.exp ?? 0),
    };

    if ("oboProvider" in opts) {
      return {
        ...session,
        apiToken: (audience) => opts.oboProvider(token, audience),
      };
    }
    return session;
  };
}

export { decodeJwt } from "jose";

export { getSession } from "./provider";
