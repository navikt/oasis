import { HttpResponse, http } from "msw";
import { SetupServer, setupServer } from "msw/node";
import {
  validateToken,
  validateIdportenToken,
  validateAzureToken,
  validateTokenxToken,
} from "./validate";
import { jwk, token } from "./test-provider";

describe("validate token", () => {
  afterEach(() => {
    delete process.env.IDPORTEN_ISSUER;
    delete process.env.AZURE_OPENID_CONFIG_ISSUER;
    delete process.env.TOKEN_X_ISSUER;
  });

  it("fails for empty token", async () => {
    expect((await validateToken("")).ok).toBe(false);
  });

  it("fails with no identity provider", async () => {
    const result = await validateToken(await token());
    expect(result.ok).toBe(false);
  });

  it("fails with multiple identity providers", async () => {
    process.env.IDPORTEN_ISSUER = "idporten_issuer";
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    const result = await validateToken(await token());
    expect(result.ok).toBe(false);
  });

  it("selects idporten", async () => {
    process.env.IDPORTEN_JWKS_URI = "http://idporten-provider.test/jwks";
    process.env.IDPORTEN_ISSUER = "idporten_issuer";

    const result = await validateToken(await token());
    expect(result.ok).toBe(false);
  });

  it("selects azure", async () => {
    process.env.AZURE_OPENID_CONFIG_JWKS_URI =
      "http://azure-provider.test/jwks";
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    const result = await validateToken(await token());
    expect(result.ok).toBe(false);
  });

  it("doesn't select tokenx", async () => {
    process.env.TOKEN_X_JWKS_URI = "http://tokenx-provider.test/jwks";
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";

    const result = await validateToken(await token());
    expect(result.ok).toBe(false);
  });
});

describe("validate idporten token", () => {
  let server: SetupServer;

  beforeAll(() => {
    process.env.IDPORTEN_JWKS_URI = "http://idporten-provider.test/jwks";
    process.env.IDPORTEN_ISSUER = "idporten_issuer";
    process.env.IDPORTEN_AUDIENCE = "idporten_audience";

    server = setupServer(
      http.get(process.env.IDPORTEN_JWKS_URI, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("fails verification when issuer is not idporten", async () => {
    const result = await validateIdportenToken(
      await token({
        audience: "idporten_audience",
        issuer: "not idporten",
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("works with Bearer prefix", async () => {
    expect(
      (
        await validateIdportenToken(
          `Bearer ${await token({
            audience: "idporten_audience",
            issuer: "idporten_issuer",
          })}`,
        )
      ).ok,
    ).toBe(true);
  });

  it("fails verification when audience is not idporten", async () => {
    const result = await validateIdportenToken(
      await token({
        audience: "not idporten",
        issuer: "idporten_issuer",
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("fails verification when alg is not RS256", async () => {
    const result = await validateIdportenToken(
      await token({
        audience: "idporten_audience",
        issuer: "idporten_issuer",
        algorithm: "PS256",
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("fails verification when token is expired", async () => {
    const result = await validateIdportenToken(
      await token({
        audience: "idporten_audience",
        issuer: "idporten_issuer",
        exp: "5 minutes ago",
      }),
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errorType).toBe("token expired");
  });
});

describe("validate azure token", () => {
  let server: SetupServer;

  beforeAll(() => {
    process.env.AZURE_OPENID_CONFIG_JWKS_URI =
      "http://azure-provider.test/jwks";
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";
    process.env.AZURE_APP_CLIENT_ID = "azure_audience";

    server = setupServer(
      http.get(process.env.AZURE_OPENID_CONFIG_JWKS_URI, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("succeeds for valid token", async () => {
    expect(
      (
        await validateAzureToken(
          await token({
            audience: "azure_audience",
            issuer: "azure_issuer",
          }),
        )
      ).ok,
    ).toBe(true);
  });
});

describe("validate tokenx token", () => {
  let server: SetupServer;

  beforeAll(() => {
    process.env.TOKEN_X_JWKS_URI = "http://tokenx-provider.test/jwks";
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";
    process.env.TOKEN_X_CLIENT_ID = "tokenx_audience";

    server = setupServer(
      http.get(process.env.TOKEN_X_JWKS_URI, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("succeeds for valid token", async () => {
    expect(
      (
        await validateTokenxToken(
          await token({
            audience: "tokenx_audience",
            issuer: "tokenx_issuer",
          }),
        )
      ).ok,
    ).toBe(true);
  });
});
