import { withCache } from "../token-cache";
import { TokenResult } from "../token-result";
import { texas } from "../texas/texas";
import type { IdentityProvider } from "../texas/types.gen";
import { stripBearer } from "../token/utils";

export type OboProvider = (
  token: string,
  audience: string,
) => Promise<TokenResult>;

const grantOboToken: (
  token: string,
  target: string,
  provider: IdentityProvider,
) => Promise<TokenResult> = async (token, target, provider) => {
  try {
    const { access_token } = await texas.exchange(token, target, provider);

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
  (token: string, scope: string): Promise<TokenResult> =>
    grantOboToken(token, scope, "azuread"),
);

/**
 * Requests on-behalf-of token from Tokenx. Requires Tokenx to be enabled in
 * nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestTokenxOboToken: OboProvider = withCache(
  (token: string, audience: string): Promise<TokenResult> =>
    grantOboToken(token, audience, "tokenx"),
);

/**
 * Requests on-behalf-of token from Tokenx or Azure. Requires either Tokenx or
 * Azure to be enabled in nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestOboToken: OboProvider = async (token, audience) => {
  if (!token) return TokenResult.Error("empty token");
  if (!audience) return TokenResult.Error("empty audience");

  const tokenx: boolean = !!process.env.TOKEN_X_ISSUER;
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER;

  if (tokenx && azure) {
    return TokenResult.Error(
      "Multiple identity providers, use requestTokenxOboToken or requestAzureOboToken directly!",
    );
  } else if (tokenx) {
    return requestTokenxOboToken(stripBearer(token), audience);
  } else if (azure) {
    return requestAzureOboToken(stripBearer(token), audience);
  } else {
    return TokenResult.Error(
      "No identity provider configured in your nais.yaml",
    );
  }
};
