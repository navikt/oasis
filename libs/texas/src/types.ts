import type { TokenExchangeRequest, TokenRequest } from "./types.gen";

type Environments = `${"dev" | "prod"}-${"gcp" | "fss"}`;

type AzureAdTarget =
  | `api://${Environments}.${string}.${string}/.default`
  | `https://graph.microsoft.com/${".default" | `${string}.${string}`}`;

type TokenxTarget = `${Environments}:${string}:${string}`;

export type TokenExchangeIdentityProvider = "azuread" | "tokenx";

export type FancyTokenExchangeRequest = Omit<
  TokenExchangeRequest,
  "identity_provider" | "target"
> &
  (
    | {
        identity_provider: "azuread";
        target: AzureAdTarget;
      }
    | {
        identity_provider: "tokenx";
        target: TokenxTarget;
      }
  );

export type TokenRequestIdentityProvider = "azuread" | "maskinporten";

/**
 * A union variation of texas' TokenRequest that uses string template literal
 * to enforce specific formatting on the target field.
 */
export type FancyTokenRequest = Omit<
  TokenRequest,
  "target" | "identity_provider" | "resource"
> &
  (
    | {
        identity_provider: "azuread";
        target: AzureAdTarget;
      }
    | {
        identity_provider: "maskinporten";
        target: `${string}:${string}`;
        resource?: string;
      }
  );
