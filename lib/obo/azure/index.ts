import { Client, GrantBody, GrantExtras } from "openid-client";
import { getClient, getClientConfig } from "./client";
import { tokenExchange } from "../tokenExchange";

function getGrantBody(subject_token: string, audience: string): GrantBody {
  return {
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: subject_token,
    scope: audience,
    requested_token_use: "on_behalf_of",
  };
}

function getAdditionalClaims(): GrantExtras {
  const { token_endpoint } = getClientConfig();
  const now = Math.floor(Date.now() / 1000);
  return {
    clientAssertionPayload: {
      nbf: now,
      aud: token_endpoint,
    },
  };
}

let _cached: Client;

function cachedClient() {
  if (!_cached) {
    _cached = getClient();
  }
  return _cached;
}

export default async function azureOBO(
  token: string,
  audience: string
): Promise<string | null> {
  return tokenExchange(
    cachedClient(),
    getGrantBody(token, audience),
    getAdditionalClaims()
  );
}
