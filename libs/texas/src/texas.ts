import { getTexasConfig } from "./config";
import type { FancyTokenExchangeRequest, FancyTokenRequest } from "./types";
import type {
  ErrorResponse,
  IntrospectRequest,
  IntrospectResponse,
  TokenExchangeRequest,
  TokenRequest,
  TokenResponse,
} from "./types.gen";

export const texas = {
  introspect: async (
    payload: IntrospectRequest,
  ): Promise<IntrospectResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.introspection, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload satisfies IntrospectRequest),
    });

    if (!response.ok) {
      throw Error(
        `Introspection failed: ${response.status} ${response.statusText}, cause: ${await response.text()}`,
      );
    }

    return (await response.json()) as IntrospectResponse;
  },
  exchange: async (
    payload: FancyTokenExchangeRequest,
  ): Promise<TokenResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.exchange, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload satisfies TokenExchangeRequest),
    });

    if (!response.ok) {
      if (
        (response.status === 400 || response.status === 500) &&
        response.headers.get("Content-Type") === "application/json"
      ) {
        const errorResponse = (await response.json()) as ErrorResponse;
        throw Error(errorResponse.error_description);
      }

      throw Error(
        `Token exchange failed: ${response.status} ${response.statusText}, cause: ${await response.text()}`,
      );
    }

    return (await response.json()) as TokenResponse;
  },
  token: async (payload: FancyTokenRequest): Promise<TokenResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload satisfies TokenRequest),
    });

    if (!response.ok) {
      if (
        (response.status === 400 || response.status === 500) &&
        response.headers.get("Content-Type") === "application/json"
      ) {
        const errorResponse = (await response.json()) as ErrorResponse;
        throw Error(errorResponse.error_description);
      }

      throw Error(
        `Token request failed: ${response.status} ${response.statusText}, cause: ${await response.text()}`,
      );
    }

    return (await response.json()) as TokenResponse;
  },
};
