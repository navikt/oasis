import { HttpResponse, http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { expectNotOK, expectOK } from "../test-expect";
import { jwkPrivate, token } from "../test-provider";
import type {
  ErrorResponse,
  TokenExchangeRequest,
  TokenExchangeResponse,
} from "../texas/types.gen";
import { decodeJwt } from "../token/utils";

import {
  requestAzureOboToken,
  requestOboToken,
  requestTokenxOboToken,
} from ".";

describe("request obo token", () => {
  afterEach(() => {
    delete process.env.TOKEN_X_ISSUER;
    delete process.env.AZURE_OPENID_CONFIG_ISSUER;
  });

  it("fails for empty token", async () => {
    const result = await requestOboToken("", "");
    expectNotOK(result);
  });

  it("fails for empty audience", async () => {
    const result = await requestOboToken(await token(), "");
    expectNotOK(result);
  });

  it("fails with no identity provider", async () => {
    const result = await requestOboToken(await token(), "audience");
    expectNotOK(result);
  });

  it("fails with multiple identity providers", async () => {
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    const result = await requestOboToken(await token(), "audience");
    expectNotOK(result);
  });

  it("selects tokenx", async () => {
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";
    process.env.TOKEN_X_TOKEN_ENDPOINT = "http://tokenx.test/token";
    process.env.TOKEN_X_PRIVATE_JWK = JSON.stringify(await jwkPrivate());
    process.env.TOKEN_X_CLIENT_ID = "token_x_client_id";

    const result = await requestOboToken(await token(), "audience");
    expectNotOK(result);
  });

  it("selects azure", async () => {
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azuer_issuer";
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT = "http://azure.test/token";
    process.env.AZURE_APP_CLIENT_ID = "azure_client_id";
    process.env.AZURE_APP_JWK = JSON.stringify(await jwkPrivate());

    const result = await requestOboToken(await token(), "audience");
    expectNotOK(result);
  });
});

describe("request tokenX obo token", () => {
  let server: SetupServer;

  beforeAll(async () => {
    process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT =
      "http://texas/api/v1/token/exchange";

    server = setupServer(
      http.post<
        never,
        TokenExchangeRequest,
        TokenExchangeResponse | ErrorResponse
      >(process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT, async ({ request }) => {
        const body = await request.json();

        if (body.target === "error-audience") {
          return HttpResponse.json(
            {
              error: "invalid_scope",
              error_description: "Invalid or missing scope",
            },
            { status: 400 },
          );
        } else if (body.target === "short-expiration") {
          return HttpResponse.json({
            access_token: await token({
              issuer: "urn:tokenx:dings",
              audience: body.target,
              exp: Math.round(Date.now() / 1000) + 7,
            }),
            expires_in: Math.round(Date.now() / 1000) + 7,
            token_type: "Bearer",
          });
        } else {
          return HttpResponse.json({
            access_token: await token({
              issuer: "urn:tokenx:dings",
              audience: body.target,
            }),
            expires_in: 3600,
            token_type: "Bearer",
          });
        }
      }),
    );
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("returns token when exchanges succeeds", async () => {
    const jwt = await token({
      audience: "idporten_audience",
      issuer: "idporten_issuer",
    });
    const result = await requestTokenxOboToken(jwt, "audience");

    expectOK(result);
    expect(decodeJwt(result.token).iss).toBe("urn:tokenx:dings");
    expect(decodeJwt(result.token).nbf).toBe(undefined);
  });

  it("accepts Bearer prefix", async () => {
    const jwt = await token({
      audience: "idporten_audience",
      issuer: "idporten_issuer",
    });
    const result = await requestTokenxOboToken(`Bearer ${jwt}`, "audience");

    expectOK(result);
    expect(decodeJwt(result.token).iss).toBe("urn:tokenx:dings");
    expect(decodeJwt(result.token).nbf).toBe(undefined);
  });

  it("toString throws", async () => {
    await expect(async () => {
      const result = await requestTokenxOboToken(
        await token({
          audience: "idporten_audience",
          issuer: "idporten_issuer",
        }),
        "audience",
      );
      console.log(`Bearer ${result}`);
    }).rejects.toThrow();
  });

  it("returns error when exchange fails", async () => {
    const result = await requestTokenxOboToken(
      await token({
        audience: "idporten_audience",
        issuer: "idporten_issuer",
      }),
      "error-audience",
    );
    expectNotOK(result);
  });

  it("returns cached token", async () => {
    const clientToken = await token({
      audience: "idporten_audience",
      issuer: "idporten_issuer",
    });
    const result = await requestTokenxOboToken(clientToken, "audience");
    const result2 = await requestTokenxOboToken(clientToken, "audience");

    expectOK(result);
    expectOK(result2);

    const token1 = decodeJwt(result.token);
    const token2 = decodeJwt(result2.token);

    expect(token1.jti).toBe(token2.jti);
  });

  it("cache times out", async () => {
    const clientToken = await token({
      audience: "idporten_audience",
      issuer: "idporten_issuer",
    });
    const result = await requestTokenxOboToken(clientToken, "short-expiration");

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result2 = await requestTokenxOboToken(
      clientToken,
      "short-expiration",
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result3 = await requestTokenxOboToken(
      clientToken,
      "short-expiration",
    );

    expectOK(result);
    expectOK(result2);
    expectOK(result3);

    const token1 = decodeJwt(result.token);
    const token2 = decodeJwt(result2.token);
    const token3 = decodeJwt(result3.token);

    expect(token1.jti).toBe(token2.jti);
    expect(token1.jti).not.toBe(token3.jti);
  });
});

describe("request azure obo token", () => {
  let server: SetupServer;

  beforeAll(async () => {
    process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT =
      "http://texas/api/v1/token/exchange";

    server = setupServer(
      http.post<
        never,
        TokenExchangeRequest,
        TokenExchangeResponse | ErrorResponse
      >(process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT, async ({ request }) => {
        const body = await request.json();

        /*if (client_assert_token.payload.aud !== "http://azure.test/token") {
          console.error(
            "wrong client_assert.aud",
            client_assert_token.payload.aud,
          );
          return HttpResponse.json({});
        } else if (
          grant_type !== "urn:ietf:params:oauth:grant-type:jwt-bearer"
        ) {
          console.error("wrong grant_type");
          return HttpResponse.json({});
        } else if (requested_token_use !== "on_behalf_of") {
          console.error("wrong requested_token_use");
          return HttpResponse.json({});
        } else if (client_id !== "azure_client_id") {
          console.error("wrong client_id");
          return HttpResponse.json({});
        } else if (
          client_assertion_type !==
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
        ) {
          console.error("wrong client_assertion_type");
          return HttpResponse.json({});
        } else if (
          Math.abs(
            client_assert_token.payload.nbf! - Math.floor(Date.now() / 1000),
          ) > 10
        ) {
          console.error("wrong client_assert_token.payload.nbf");
          return HttpResponse.json({});
        } else if (!client_assert_token.payload.jti) {
          console.error("missing client_assert_token.payload.jti");
          return HttpResponse.json({});
        } else if (
          client_assert_token.payload.exp! - Math.floor(Date.now() / 1000) >
          120
        ) {
          console.error("client_assert_token.payload.exp too large");
          return HttpResponse.json({});
        } else*/
        if (body.target === "error-audience") {
          return HttpResponse.json(
            {
              error: "invalid_scope",
              error_description: "Invalid or missing scope",
            },
            { status: 400 },
          );
        } else {
          return HttpResponse.json({
            access_token: await token({
              issuer: "urn:azure:dings",
              audience: body.target,
            }),
            expires_in: 3600,
            token_type: "Bearer",
          });
        }
      }),
    );
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("returns token when exchanges succeeds", async () => {
    const jwt = await token({
      audience: "azure_audience",
      issuer: "azure_issuer",
    });
    const result = await requestAzureOboToken(jwt, "audience");

    expectOK(result);
    expect(decodeJwt(result.token).iss).toBe("urn:azure:dings");
    expect(decodeJwt(result.token).nbf).toBe(undefined);
  });

  it("returns error when exchange fails", async () => {
    const result = await requestAzureOboToken(
      await token({
        audience: "azure_audience",
        issuer: "azure_issuer",
      }),
      "error-audience",
    );
    expectNotOK(result);
  });
});
