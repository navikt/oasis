import { memoize } from "lodash";
import { Client, errors, GrantBody, GrantExtras, Issuer } from "openid-client";
import { JWK } from "jose/dist/types/types";
import OPError = errors.OPError;

export interface ClientConfig {
  issuer: string;
  tokenEndpoint: string;
  clientId: string;
  privateJWK: JWK;
}

function client(config: ClientConfig): Client {
  const issuer = new Issuer({
    issuer: config.issuer,
    token_endpoint: config.tokenEndpoint,
    token_endpoint_auth_signing_alg_values_supported: ["RS256"],
  });
  const jwk = config.privateJWK;
  return new issuer.Client(
    {
      client_id: config.clientId,
      token_endpoint_auth_method: "private_key_jwt",
    },
    { keys: [jwk] }
  );
}

function additionalClaims(aud: string): GrantExtras {
  const now = Math.floor(Date.now() / 1000);
  return {
    clientAssertionPayload: {
      nbf: now,
      aud,
    },
  };
}

function grantBody(audience: string, subject_token: string): GrantBody {
  return {
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    audience,
    subject_token,
  };
}

export type getToken = (
  subject_token: string,
  audience: string
) => Promise<string | undefined>;

export function createGetToken(options: () => ClientConfig): getToken {
  const _client = memoize(() => client(options()));
  return async function getToken(
    subject_token: string,
    audience: string
  ): Promise<string | undefined> {
    try {
      const tokenset = await _client().grant(
        grantBody(audience, subject_token),
        additionalClaims(options().tokenEndpoint)
      );
      return tokenset.access_token;
    } catch (e) {
      if (e instanceof OPError) console.warn(e.message, e.response?.body || "");
      throw e;
    }
  };
}

export default memoize(client);
