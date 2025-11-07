import texas, {
  type AzureAdTarget,
  type TokenxTarget,
  type TokenExchangeIdentityProvider,
} from "@navikt/texas";

import { failSpan, OtelTaxonomy, spanAsync } from "../../lib/otel";
import { TokenResult } from "../../token-result";

export type InternalOboProvider = (
  provider: TokenExchangeIdentityProvider,
  token: string,
  target: string,
) => Promise<TokenResult>;

export const grantOboToken: (
  provider: TokenExchangeIdentityProvider,
  token: string,
  target: string,
) => Promise<TokenResult> = async (provider, token, target) => {
  return spanAsync("Token exchange (OBO)", async (span) => {
    span.setAttributes({
      [OtelTaxonomy.OboExchangeTarget]: target,
      [OtelTaxonomy.OboExchangeProvider]: provider,
    });

    try {
      const { access_token } = await texas.exchange(
        provider === "azuread"
          ? {
              identity_provider: provider,
              user_token: token,
              target: target as AzureAdTarget,
            }
          : {
              identity_provider: provider,
              user_token: token,
              target: target as TokenxTarget,
            },
      );

      return access_token
        ? TokenResult.Ok(access_token)
        : TokenResult.Error(Error("TokenSet does not contain an access_token"));
    } catch (e) {
      failSpan(span, "OBO token exchange failed", e);

      return TokenResult.Error(e as Error);
    }
  });
};
