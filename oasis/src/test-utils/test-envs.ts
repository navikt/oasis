export function setTexasNaisTestEnvs() {
  process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT =
    "http://texas/api/v1/introspect";
  process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT =
    "http://texas/api/v1/exchange/token";
  process.env.NAIS_TOKEN_ENDPOINT = "http://texas/api/v1/token";

  return {
    introspection: process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT,
    exchange: process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT,
    token: process.env.NAIS_TOKEN_ENDPOINT,
  };
}

export function clearTexasNaisTestEnvs(): void {
  delete process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT;
  delete process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT;
  delete process.env.NAIS_TOKEN_ENDPOINT;
}
