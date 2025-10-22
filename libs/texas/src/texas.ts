import type {
  ErrorResponse,
  IdentityProvider,
  IntrospectRequest,
  IntrospectResponse,
  TokenExchangeRequest,
  TokenRequest,
  TokenResponse,
} from "./types.gen";

export const texas = {
  introspect: async (
    token: string,
    provider: IdentityProvider,
  ): Promise<IntrospectResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.introspection, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity_provider: provider,
        token: token,
      } satisfies IntrospectRequest),
    });

    if (!response.ok) {
      throw Error(
        `Introspection failed: ${response.status} ${response.statusText}, cause: ${await response.text()}`,
      );
    }

    return (await response.json()) as IntrospectResponse;
  },
  exchange: async (
    token: string,
    target: string,
    provider: IdentityProvider,
  ): Promise<TokenResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.exchange, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: target,
        identity_provider: provider,
        user_token: token,
      } satisfies TokenExchangeRequest),
    });

    if (!response.ok) {
      if (
        response.status === 400 &&
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
  token: async (
    provider: IdentityProvider,
    target: `api://${string}.${string}.${string}/.default`,
  ): Promise<TokenResponse> => {
    const config = getTexasConfig();
    const response = await fetch(config.token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity_provider: provider,
        target: target,
      } satisfies TokenRequest),
    });

    if (!response.ok) {
      if (
        response.status === 400 &&
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

const getTexasConfig = () => {
  if (
    !process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT ||
    !process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT ||
    !process.env.NAIS_TOKEN_ENDPOINT
  ) {
    throw Error(
      "This ain't texas! Missing NAIS_TOKEN_-environment variables. Are you in NAIS?",
    );
  }

  return {
    introspection: process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT,
    exchange: process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT,
    token: process.env.NAIS_TOKEN_ENDPOINT,
  };
};
