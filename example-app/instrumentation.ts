import { exportJWK, generateKeyPair } from "jose";

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "development"
  ) {
    const key = await generateKeyPair("RS256", { extractable: true });

    process.env.PRIVATE_KEY = JSON.stringify(await exportJWK(key.privateKey));
    process.env.PUBLIC_KEY = JSON.stringify(await exportJWK(key.publicKey));
    process.env.TOKEN_X_PRIVATE_JWK = process.env.PRIVATE_KEY;

    const { server } = await import("./mocks/msw");
    server.listen();
  }
}
