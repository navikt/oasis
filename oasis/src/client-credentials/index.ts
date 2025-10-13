import { texas } from "../texas/texas";
import type { IdentityProvider } from "../texas/types.gen";
import { withCache } from "../token-cache";
import { TokenResult } from "../token-result";

export type ClientCredientialsProvider = (
  scope: string,
) => Promise<TokenResult>;

/**
 * Requests client credentials token from Azure. Requires Azure to be enabled in
 * nais application manifest.
 *
 * @param audience The target app you request a token for.
 */
export const requestAzureClientCredentialsToken: ClientCredientialsProvider =
  withCache(async (scope) => grantClientCredentialsToken("azuread", scope));

const grantClientCredentialsToken: (
  provider: IdentityProvider,
  target: string,
) => Promise<TokenResult> = async (provider, target) => {
  try {
    const { access_token } = await texas.token(
      provider,
      target as `api://${string}.${string}.${string}/.default`,
    );

    return access_token
      ? TokenResult.Ok(access_token)
      : TokenResult.Error(Error("TokenSet does not contain an access_token"));
  } catch (e) {
    return TokenResult.Error(e as Error);
  }
};
