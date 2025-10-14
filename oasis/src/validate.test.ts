import { HttpResponse, http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  clearTexasNaisTestEnvs,
  setTexasNaisTestEnvs,
} from "./test-utils/test-envs";
import { expectNotOK, expectOK } from "./test-utils/test-expect";
import { token } from "./test-utils/test-provider";
import type { IntrospectRequest, IntrospectResponse } from "./texas/types.gen";
import { decodeJwt } from "./token/utils";
import {
  validateAzureToken,
  validateIdportenToken,
  validateToken,
  validateTokenxToken,
} from "./validate";

describe("validate token", () => {
  let server: SetupServer;

  beforeAll(() => {
    const texasEnv = setTexasNaisTestEnvs();

    server = setupServer(
      http.post<never, IntrospectRequest, IntrospectResponse>(
        texasEnv.introspection,
        async ({ request }) => {
          const body = await request.json();

          if (body.identity_provider === "idporten") {
            return HttpResponse.json({
              active: true,
              iss: "idporten_issuer",
            });
          } else if (body.identity_provider === "azuread") {
            return HttpResponse.json({
              active: true,
              iss: "azure_issuer",
            });
          }

          throw Error(`Not implemented: ${body.identity_provider}`);
        },
      ),
    );
    server.listen();
  });

  afterAll(() => {
    clearTexasNaisTestEnvs();

    server.close();
  });

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
    expectNotOK(result);
  });

  it("fails with multiple identity providers", async () => {
    process.env.IDPORTEN_ISSUER = "idporten_issuer";
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    const result = await validateToken(await token());
    expectNotOK(result);
  });

  it("selects idporten", async () => {
    process.env.IDPORTEN_ISSUER = "idporten_issuer";

    const result = await validateToken(await token());
    expectOK(result);
    expect(result.payload.iss).toEqual("idporten_issuer");
  }, 10_000);

  it("selects azure", async () => {
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    const result = await validateToken(await token());
    expectOK(result);
    expect(result.payload.iss).toEqual("azure_issuer");
  }, 10_000);

  it("doesn't select tokenx", async () => {
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";

    const result = await validateToken(await token());
    expectNotOK(result);
  });
});

describe("validate idporten token", () => {
  let server: SetupServer;

  beforeAll(() => {
    const texasEnv = setTexasNaisTestEnvs();
    process.env.IDPORTEN_ISSUER = "idporten_issuer";

    server = setupServer(
      http.post<never, IntrospectRequest, IntrospectResponse>(
        texasEnv.introspection,
        async ({ request }) => {
          const body = await request.json();
          const pid = decodeJwt(body.token).pid;

          if (body.identity_provider === "idporten") {
            return HttpResponse.json({
              active: true,
              iss: "idporten_issuer",
              pid: pid ?? "not set",
            });
          } else if (body.identity_provider === "azuread") {
            return HttpResponse.json({
              active: true,
              iss: "azure_issuer",
              pid: pid ?? "not set",
            });
          }

          throw Error(`Not implemented: ${body.identity_provider}`);
        },
      ),
    );
    server.listen();
  });

  afterAll(() => {
    clearTexasNaisTestEnvs();
    delete process.env.IDPORTEN_ISSUER;

    server.close();
  });

  it("succeeds for valid token", async () => {
    const result = await validateIdportenToken(
      await token({
        pid: "12345678901",
        audience: "idporten_audience",
        issuer: "idporten_issuer",
      }),
    );

    expectOK(result);
    expect(result.payload.pid).toBe("12345678901");
  });

  it("works with Bearer prefix", async () => {
    const result = await validateIdportenToken(
      `Bearer ${await token({
        audience: "idporten_audience",
        issuer: "idporten_issuer",
      })}`,
    );

    expectOK(result);
  });
});

describe("validate azure token", () => {
  let server: SetupServer;

  beforeAll(() => {
    const texasEnv = setTexasNaisTestEnvs();
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";

    server = setupServer(
      http.post<never, IntrospectRequest, IntrospectResponse>(
        texasEnv.introspection,
        async ({ request }) => {
          const body = await request.json();
          const pid = decodeJwt(body.token).pid;

          if (body.identity_provider === "azuread") {
            return HttpResponse.json({
              active: true,
              iss: "azure_issuer",
              pid: pid ?? "not set",
            });
          }

          throw Error(`Not implemented: ${body.identity_provider}`);
        },
      ),
    );
    server.listen();
  });

  afterAll(() => {
    clearTexasNaisTestEnvs();
    delete process.env.AZURE_OPENID_CONFIG_ISSUER;

    server.close();
  });

  it("succeeds for valid token", async () => {
    const result = await validateAzureToken(
      await token({
        audience: "azure_audience",
        issuer: "azure_issuer",
      }),
    );
    expectOK(result);
  });
});

describe("validate tokenx token", () => {
  let server: SetupServer;

  beforeAll(() => {
    const texasEnv = setTexasNaisTestEnvs();
    process.env.TOKEN_X_ISSUER = "tokenx_issuer";

    server = setupServer(
      http.post<never, IntrospectRequest, IntrospectResponse>(
        texasEnv.introspection,
        async ({ request }) => {
          const body = await request.json();
          const pid = decodeJwt(body.token).pid;

          if (body.identity_provider === "tokenx") {
            return HttpResponse.json({
              active: true,
              iss: "tokenx_issuer",
              pid: pid ?? "not set",
            });
          }

          throw Error(`Not implemented: ${body.identity_provider}`);
        },
      ),
    );
    server.listen();
  });

  afterAll(() => {
    clearTexasNaisTestEnvs();
    delete process.env.TOKEN_X_ISSUER;

    server.close();
  });

  it("succeeds for valid token", async () => {
    const result = await validateTokenxToken(
      await token({
        audience: "tokenx_audience",
        issuer: "tokenx_issuer",
      }),
    );
    expectOK(result);
  });
});
