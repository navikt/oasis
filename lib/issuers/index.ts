import { AuthProvider } from "../server/middleware";
import azureAd from "./azure-ad";
import tokenx from "./tokenx";

export type GetToken = (
  subject_token: string,
  audience: string
) => Promise<string | undefined>;

export interface TokenIssuer {
  exchangeToken: () => GetToken;
}

export function apiToken(provider: AuthProvider, subject_token: string) {
  switch (provider.name) {
    case "idporten":
      return async (audience: string) =>
        tokenx.exchangeToken()(subject_token, audience);
    case "azureAd":
      return async (audience: string) =>
        azureAd.exchangeToken()(subject_token, audience);
    default:
      throw new Error("Missing token issuer for this provider");
  }
}
