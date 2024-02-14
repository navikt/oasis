import { JWK } from "jose";
import memoize from "lodash.memoize";
import { Client, Issuer } from "openid-client";

export interface ClientConfig {
  issuer: string;
  token_endpoint: string;
  client_id: string;
  client_secret?: string;
  jwk: JWK;
}

export const getClientConfig = memoize((): ClientConfig => {
  return {
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER as string,
    token_endpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT as string,
    client_id: process.env.AZURE_APP_CLIENT_ID as string,
    client_secret: process.env.AZURE_APP_CLIENT_SECRET as string,
    jwk: JSON.parse(process.env.AZURE_APP_JWK as string) as JWK,
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
  const { jwk, client_id, client_secret } = getClientConfig();
  const issuer = getIssuer();
  return new issuer.Client(
    {
      client_id,
      client_secret,
      token_endpoint_auth_method: "client_secret_basic",
    },
    { keys: [jwk] },
  );
}
