import { idporten, tokenx } from "../providers";
import { IncomingMessage } from "http";
import { Session } from "./index";

export interface CtxOrReq {
  req?: IncomingMessage;
  ctx?: { req: IncomingMessage };
}

/**
 * Helper for å hente token, sesjon, og helper for å hente nøkler for APIer bakover
 *
 * 1. API routes: getSession({ req })
 * 2. SSR data fetcher: getSession(context)
 */
export async function getSession({
  ctx,
  req = ctx?.req,
}: CtxOrReq = {}): Promise<Session> {
  const { authorization } = req.headers;
  if (!authorization) return {};

  const token = authorization.split(" ")[1];
  const { payload } = await idporten.validerToken(token);
  if (!payload) return {};

  return { token, payload, apiToken: apiToken(token) };
}

function apiToken(subject_token: string) {
  return async (audience: string) => tokenx.getToken(subject_token, audience);
}
