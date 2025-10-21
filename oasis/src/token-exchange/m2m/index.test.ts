import { HttpResponse, http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { decodeJwt } from "../../lib/utils";
import {
  clearTexasNaisTestEnvs,
  setTexasNaisTestEnvs,
} from "../../test/test-envs";
import { expectNotOK, expectOK } from "../../test/test-expect";
import { token } from "../../test/test-provider";
import type {
  ErrorResponse,
  TokenRequest,
  TokenResponse,
} from "../../texas/types.gen";

import { requestAzureClientCredentialsToken } from "./index";

describe("request azure client-credentials token", () => {
  let server: SetupServer;

  beforeAll(async () => {
    const texasEnv = setTexasNaisTestEnvs();

    server = setupServer(
      http.post<never, TokenRequest, TokenResponse | ErrorResponse>(
        texasEnv.token,
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
  afterAll(() => {
    clearTexasNaisTestEnvs();

    server.close();
  });

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
