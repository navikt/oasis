import { withCache } from "../../token-cache";
import type { TokenResult } from "../../token-result";

import { grantClientCredentialsToken } from "./exchange";

/**
 * Requests client credentials token from Azure. Requires Azure to be enabled in
 * nais application manifest.
 *
 * @param target The target app you request a token for.
 */
export const requestAzureClientCredentialsToken = async (
  target: string,
): Promise<TokenResult> =>
  withCache(
    (provider, target) => grantClientCredentialsToken(provider, target),
    "client-credentials",
  )("azuread", target);
