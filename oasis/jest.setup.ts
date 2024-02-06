import { exportJWK, generateKeyPair } from "jose";
import { server } from "./__tests__/__utils__/mocks";
import { jwkPrivate } from "./__tests__/__utils__/test-provider";

beforeAll(async () => {
  server.listen({ onUnhandledRequest: "warn" });
  const privateKey = JSON.stringify(await jwkPrivate());
  process.env.AZURE_APP_JWK = privateKey;
  process.env.TOKEN_X_PRIVATE_JWK = privateKey;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
