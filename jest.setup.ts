import "@testing-library/jest-dom/extend-expect";
import { server } from "./lib/mocks/server";
import { exportJWK, generateKeyPair } from "jose";

beforeAll(async () => {
  server.listen({ onUnhandledRequest: "warn" });
  process.env.TOKEN_X_PRIVATE_JWK = JSON.stringify({
    ...(await exportJWK((await generateKeyPair("RS256")).privateKey)),
    alg: "RS256",
  });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
