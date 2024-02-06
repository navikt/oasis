import { jwkPrivate } from "./__tests__/__utils__/test-provider";

beforeAll(async () => {
  const privateKey = JSON.stringify(await jwkPrivate());
  process.env.AZURE_APP_JWK = privateKey;
  process.env.TOKEN_X_PRIVATE_JWK = privateKey;
});
