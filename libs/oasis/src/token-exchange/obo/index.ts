import type { TokenExchangeIdentityProvider } from "@navikt/texas";

import { stripBearer } from "../../lib/utils";
import { withCache } from "../../token-cache";
import { TokenResult } from "../../token-result";

import { grantOboToken } from "./exchange";
import { withPrometheus } from "./prometheus";

/**
 * Requests on-behalf-of token from Azure. Requires Azure to be enabled in nais
 * application manifest.
 *
 * @param token Token from your client (assertion).
 * @param audience The target app you request a token for (scope).
 */
export const requestAzureOboToken = async (
  token: string,
  audience: string,
): Promise<TokenResult> =>
  withCache(
    withPrometheus((provider: TokenExchangeIdentityProvider, token, target) =>
      grantOboToken(provider, token, target),
    ),
  )("azuread", token, audience);

/**
 * Requests on-behalf-of token from Tokenx. Requires Tokenx to be enabled in
 * nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestTokenxOboToken = async (
  token: string,
  audience: string,
): Promise<TokenResult> =>
  withCache(
    withPrometheus((provider: TokenExchangeIdentityProvider, token, audience) =>
      grantOboToken(provider, token, audience),
    ),
  )("tokenx", token, audience);

/**
 * Requests on-behalf-of token from Tokenx or Azure. Requires either Tokenx or
 * Azure to be enabled in nais application manifest.
 *
 * @param token Token from your client (subject token).
 * @param audience The target app you request a token for.
 */
export const requestOboToken = async (
  token: string,
  audience: string,
): Promise<TokenResult> => {
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
