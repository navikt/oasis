import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer, type SetupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { decodeJwt } from "jose";

import { token } from "../test-provider";

import { requestAzureClientCredentialsToken } from "./";
import { expectNotOK, expectOK } from "../test-expect";

describe("request azure client-credentials token", () => {
  let server: SetupServer;

  beforeAll(async () => {
    process.env.AZURE_OPENID_CONFIG_ISSUER = "azure_issuer";
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT = "http://azure.test/token";
    process.env.AZURE_APP_CLIENT_ID = "azure_client_id";
    process.env.AZURE_APP_CLIENT_SECRET = "azure_client_secret";

    const token_endpoint = "http://azure.test/token";

    server = setupServer(
      http.post(token_endpoint, async ({ request }) => {
        const { scope, assertion, grant_type, client_id, client_secret } =
          Object.fromEntries(new URLSearchParams(await request.text()));

        if (grant_type !== "client_credentials") {
          console.error("wrong grant_type");
          return HttpResponse.json({});
        }

        if (client_secret !== "azure_client_secret") {
          console.error("wrong azure_client_secret");
        }

        if (client_id !== "azure_client_id") {
          console.error("wrong client_id");
          return HttpResponse.json({});
        }

        if (scope === "error-audience") {
          return HttpResponse.json({});
        }

        return HttpResponse.json({
          access_token: await token({
            pid: assertion,
            issuer: "urn:azure:dings",
            audience: scope,
          }),
        });
      }),
    );
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("returns token when exchanges succeeds", async () => {
    const result = await requestAzureClientCredentialsToken(
      "api://test-app/.default",
    );

    expectOK(result);
    expect(decodeJwt(result.token).iss).toBe("urn:azure:dings");
    expect(decodeJwt(result.token).nbf).toBe(undefined);
  });

  it("returns error when exchange fails", async () => {
    const result = await requestAzureClientCredentialsToken("error-audience");

    expectNotOK(result);
    expect(result.error.message).toEqual(
      "TokenSet does not contain an access_token",
    );
  });
});
