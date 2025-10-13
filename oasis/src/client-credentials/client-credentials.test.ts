import { HttpResponse, http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { expectNotOK, expectOK } from "../test-expect";
import { token } from "../test-provider";
import type {
  ErrorResponse,
  TokenRequest,
  TokenResponse,
} from "../texas/types.gen";
import { decodeJwt } from "../token/utils";

import { requestAzureClientCredentialsToken } from "./";

describe("request azure client-credentials token", () => {
  let server: SetupServer;

  beforeAll(async () => {
    process.env.NAIS_TOKEN_ENDPOINT = "http://texas/api/v1/token";

    server = setupServer(
      http.post<never, TokenRequest, TokenResponse | ErrorResponse>(
        process.env.NAIS_TOKEN_ENDPOINT,
        async ({ request }) => {
          const body = await request.json();

          if (body.target === "error-audience") {
            return HttpResponse.json(
              {
                error: "invalid_scope",
                error_description: "Invalid or missing scope",
              },
              { status: 400 },
            );
          }

          return HttpResponse.json({
            access_token: await token({
              issuer: "urn:azure:dings",
              audience: body.target,
            }),
            expires_in: 3600,
            token_type: "Bearer",
          });
        },
      ),
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
    expect(result.error.message).toEqual("Invalid or missing scope");
  });
});
