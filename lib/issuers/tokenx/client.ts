import { memoize } from "lodash";
import env from "env-var";
import { GrantBody, GrantExtras, Issuer } from "openid-client";
import { JWK } from "jose/dist/types/types";

// Using memoize defers checking for environment variables until they are needed
const options = memoize(() => ({
  clientId: env.get("TOKEN_X_CLIENT_ID").required().asString(),
  privateJWK: env.get("TOKEN_X_PRIVATE_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env.get("TOKEN_X_TOKEN_ENDPOINT").required().asUrlString(),
  issuer: env.get("TOKEN_X_ISSUER").required().asString(),
}));

async function client() {
  const issuer = new Issuer({
    issuer: options().issuer,
    token_endpoint: options().tokenEndpoint,
    token_endpoint_auth_signing_alg_values_supported: ["RS256"],
  });
  const jwk = options().privateJWK;
  return new issuer.Client(
    {
      client_id: options().clientId,
      token_endpoint_auth_method: "private_key_jwt",
    },
    { keys: [jwk] }
  );
}

export function additionalClaims(): GrantExtras {
  const now = Math.floor(Date.now() / 1000);
  return {
    clientAssertionPayload: {
      nbf: now,
      aud: options().tokenEndpoint,
    },
  };
}

export function grantBody(audience: string, subject_token: string): GrantBody {
  return {
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    audience,
    subject_token,
  };
}

export default memoize(client);
