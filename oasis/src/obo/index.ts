import { GrantBody, Issuer } from "openid-client";
import { withCache } from "../token-cache";
import { withPrometheus } from "./prometheus";
import { stripBearer } from "../strip-bearer";
import { TokenResult } from "../token-result";

export type OboProvider = (
  token: string,
  audience: string,
) => Promise<TokenResult>;

const grantOboToken: (opts: {
  issuer: string;
  token_endpoint: string;
  client_id: string;
  jwk: string;
  grant_body: GrantBody;
}) => Promise<TokenResult> = async ({
  issuer,
  token_endpoint,
  client_id,
  jwk,
  grant_body,
}) => {
  try {
    const { access_token } = await new new Issuer({
      issuer,
      token_endpoint,
      token_endpoint_auth_signing_alg_values_supported: ["RS256"],
    }).Client(
      { client_id, token_endpoint_auth_method: "private_key_jwt" },
      { keys: [JSON.parse(jwk)] },
    ).grant(grant_body, {
      clientAssertionPayload: {
        nbf: Math.floor(Date.now() / 1000),
        aud: token_endpoint,
      },
    });

    return access_token
      ? TokenResult.Ok(access_token)
      : TokenResult.Error(Error("TokenSet does not contain an access_token"));
  } catch (e) {
    return TokenResult.Error(e as Error);
  }
};

/**
 * Requests on-behalf-of token from Azure. Requires Azure to be enabled in nais
 * application manifest.
 *
 * @param token Token from your client (assertion).
 * @param audience The target app you request a token for (scope).
 */
export const requestAzureOboToken: OboProvider = withCache(
  withPrometheus(async (token, scope) =>
    grantOboToken({
      issuer: process.env.AZURE_OPENID_CONFIG_ISSUER!,
      token_endpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!,
      client_id: process.env.AZURE_APP_CLIENT_ID!,
      jwk: process.env.AZURE_APP_JWK!,
      grant_body: {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        requested_token_use: "on_behalf_of",
        assertion: stripBearer(token),
        scope,
      },
    }),
  ),
);

/**
 * Requests on-behalf-of token from Tokenx. Requires Tokenx to be enabled in
 * nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestTokenxOboToken: OboProvider = withCache(
  withPrometheus(async (token, audience) =>
    grantOboToken({
      issuer: process.env.TOKEN_X_ISSUER!,
      token_endpoint: process.env.TOKEN_X_TOKEN_ENDPOINT!,
      client_id: process.env.TOKEN_X_CLIENT_ID!,
      jwk: process.env.TOKEN_X_PRIVATE_JWK!,
      grant_body: {
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
        subject_token: stripBearer(token),
        audience,
      },
    }),
  ),
);

/**
 * Requests on-behalf-of token from Tokenx or Azure. Requires either Tokenx or
 * Azure to be enabled in nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestOboToken: OboProvider = async (token, audience) => {
  if (!token) {
    return TokenResult.Error("empty token");
  }
  if (!audience) {
    return TokenResult.Error("empty audience");
  }

  const tokenx: boolean = !!process.env.TOKEN_X_ISSUER;
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER;

  if (tokenx && azure) {
    return TokenResult.Error("multiple identity providers");
  } else if (tokenx) {
    return requestTokenxOboToken(token, audience);
  } else if (azure) {
    return requestAzureOboToken(token, audience);
  } else {
    return TokenResult.Error("no identity provider");
  }
};
