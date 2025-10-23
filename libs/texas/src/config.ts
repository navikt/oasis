export const getTexasConfig = () => {
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
