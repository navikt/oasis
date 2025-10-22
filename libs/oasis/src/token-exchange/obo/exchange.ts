import texas, { type IdentityProvider } from "@navikt/texas";

import { failSpan, OtelTaxonomy, spanAsync } from "../../lib/otel";
import { TokenResult } from "../../token-result";

export type InternalOboProvider = (
  provider: IdentityProvider,
  token: string,
  target: string,
) => Promise<TokenResult>;

export const grantOboToken: (
  provider: IdentityProvider,
  token: string,
  target: string,
) => Promise<TokenResult> = async (provider, token, target) => {
  return spanAsync("Token exchange (OBO)", async (span) => {
    span.setAttributes({
      [OtelTaxonomy.OboExchangeTarget]: target,
      [OtelTaxonomy.OboExchangeProvider]: provider,
    });

    try {
      const { access_token } = await texas.exchange(token, target, provider);

      return access_token
        ? TokenResult.Ok(access_token)
        : TokenResult.Error(Error("TokenSet does not contain an access_token"));
    } catch (e) {
      failSpan(span, "OBO token exchange failed", e);

      return TokenResult.Error(e as Error);
    }
  });
};
