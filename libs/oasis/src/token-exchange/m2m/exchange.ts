import texas, { type IdentityProvider } from "@navikt/texas";

import { failSpan, OtelTaxonomy, spanAsync } from "../../lib/otel";
import { TokenResult } from "../../token-result";

export type InternalClientCredientialsProvider = (
  provider: IdentityProvider,
  target: string,
) => Promise<TokenResult>;

export const grantClientCredentialsToken = async (
  provider: IdentityProvider,
  target: string,
): Promise<TokenResult> => {
  return spanAsync("Token exchange (m2m)", async (span) => {
    span.setAttributes({
      [OtelTaxonomy.M2MExchangeTarget]: target,
      [OtelTaxonomy.M2MExchangeProvider]: provider,
    });

    try {
      const { access_token } = await texas.token(
        provider,
        target as `api://${string}.${string}.${string}/.default`,
      );

      return access_token
        ? TokenResult.Ok(access_token)
        : TokenResult.Error(Error("TokenSet does not contain an access_token"));
    } catch (e) {
      failSpan(span, "M2M token exchange failed", e);

      return TokenResult.Error(e as Error);
    }
  });
};
