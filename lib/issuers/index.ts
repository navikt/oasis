export interface TokenIssuer {
  exchangeToken: (
    subject_token: string,
    audience: string
  ) => Promise<string | undefined>;
}

export { default as azureAd } from "./azure-ad";
export { default as tokenx } from "./tokenx";
