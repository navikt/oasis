import { JWK } from "jose";
import _ from "lodash";
import { Client, GrantExtras, Issuer } from "openid-client";

export interface ClientConfig {
  issuer: string;
  token_endpoint: string;
  client_id: string;
  jwk: JWK;
}

const getClientConfig = _.memoize((): ClientConfig => {
  return {
    issuer: process.env.TOKEN_X_ISSUER as string,
    token_endpoint: process.env.TOKEN_X_TOKEN_ENDPOINT as string,
    client_id: process.env.TOKEN_X_CLIENT_ID as string,
    jwk: JSON.parse(process.env.TOKEN_X_PRIVATE_JWK as string) as JWK,
  };
});

function getIssuer(): Issuer {
  const { issuer, token_endpoint } = getClientConfig();
  return new Issuer({
    issuer,
    token_endpoint,
    token_endpoint_auth_signing_alg_values_supported: ["RS256"],
  });
}

export function getClient(): Client {
  const { jwk, client_id } = getClientConfig();
  const issuer = getIssuer();
  return new issuer.Client(
    {
      client_id,
      token_endpoint_auth_method: "private_key_jwt",
    },
    { keys: [jwk] }
  );
}

export function getAdditionalClaims(): GrantExtras {
  const { token_endpoint } = getClientConfig();
  const now = Math.floor(Date.now() / 1000);
  return {
    clientAssertionPayload: {
      nbf: now,
      aud: token_endpoint,
    },
  };
}
