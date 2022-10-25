import { Client, errors, GrantBody } from "openid-client";
import { getAdditionalClaims, getClient } from "./client";
import { tokenExchange } from "../tokenExchange";
import OPError = errors.OPError;

function getGrantBody(subject_token: string, audience: string): GrantBody {
  return {
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    audience,
    subject_token,
  };
}

async function getToken(
  client: Client,
  subject_token: string,
  audience: string
): Promise<string | null> {
  try {
    const tokenset = await client.grant(
      getGrantBody(audience, subject_token),
      getAdditionalClaims()
    );
    return tokenset.access_token ?? null;
  } catch (e) {
    if (e instanceof OPError) console.warn(e.message, e.response?.body || "");
    throw e;
  }
}

let _cached: Client;

function cachedClient() {
  if (!_cached) {
    _cached = getClient();
  }
  return _cached;
}

export default async function tokenX(
  token: string,
  audience: string
): Promise<string | null> {
  return tokenExchange(
    cachedClient(),
    getGrantBody(token, audience),
    getAdditionalClaims()
  );
}
