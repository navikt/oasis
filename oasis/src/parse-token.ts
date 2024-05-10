import { decodeJwt } from "jose";

export type IdportenPayload = {
  /* The users fødselsnummer */
  pid: string;
};

export type AzurePayload = {
  /* Internal NAV ID, typically on the format O123456 */
  NAVIdent: string;
  /* The users email address */
  preferred_username: string;
  /* The users full name, varying formatting */
  name: string;
};

export type ParseResult<Payload> =
  | { ok: false; error: Error }
  | ({ ok: true } & Payload);

/**
 * Parses Idporten token, returning PID if present. This does not support parsing
 * tokenx tokens.
 *
 * @param token Validated token issued by Idporten.
 */
export function parseIdportenToken(
  token: string,
): ParseResult<IdportenPayload> {
  try {
    const payload = decodeJwt(token);

    if (typeof payload.pid === "string") {
      return { ok: true, pid: payload.pid };
    }

    return {
      ok: false,
      error: new Error("Invalid or missing values in token"),
    };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error };
    }

    throw error;
  }
}

/**
 * Parses Azure user token, returning NAVIdent if present (this must be enabled
 * as extra claims in nais configuration). This does not support parsing Azure
 * machine tokens.
 *
 * @param token Validated token issued by Azure.
 */
export function parseAzureUserToken(token: string): ParseResult<AzurePayload> {
  try {
    const payload = decodeJwt(token);

    if (
      typeof payload.preferred_username === "string" &&
      typeof payload.name === "string" &&
      typeof payload.NAVIdent === "string"
    ) {
      return {
        ok: true,
        NAVIdent: payload.NAVIdent,
        preferred_username: payload.preferred_username,
        name: payload.name,
      };
    }

    return {
      ok: false,
      error: new Error(`Invalid or missing values in token`),
    };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error };
    }

    throw error;
  }
}
