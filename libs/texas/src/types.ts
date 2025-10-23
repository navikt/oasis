import type { TokenExchangeRequest, TokenRequest } from "./types.gen";

export type TokenExchangeIdentityProvider = "azuread" | "tokenx";

export type FancyTokenExchangeRequest = Omit<
  TokenExchangeRequest,
  "identity_provider"
> & {
  identity_provider: TokenExchangeIdentityProvider;
};

export type TokenRequestIdentityProvider = "azuread" | "maskinporten";

/**
 * A union variation of texas' TokenRequest that uses string template literal
 * to enforce specific formatting on the target field.
 */
export type FancyTokenRequest = Omit<
  TokenRequest,
  "target" | "identity_provider"
> &
  (
    | {
        identity_provider: "azuread";
        target: `api://${string}.${string}.${string}/.default`;
      }
    | {
        identity_provider: "maskinporten";
        target: `${string}:${string}`;
        resource?: string;
      }
  );
