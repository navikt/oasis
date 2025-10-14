import { exportJWK, generateKeyPair } from "jose";

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "development"
  ) {
    const key = await generateKeyPair("RS256", { extractable: true });

    process.env.PRIVATE_KEY = JSON.stringify(await exportJWK(key.privateKey));
    process.env.PUBLIC_KEY = JSON.stringify(await exportJWK(key.publicKey));

    process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT =
      "http://texas/api/v1/introspect";
    process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT =
      "http://texas/api/v1/exchange/token";
    process.env.NAIS_TOKEN_ENDPOINT = "http://texas/api/v1/token";

    const { server } = await import("./mocks/msw");
    server.listen();
  }
}
