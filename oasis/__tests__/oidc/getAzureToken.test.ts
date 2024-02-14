import { decodeJwt, errors } from "jose";
import { HttpResponse, http } from "msw";
import { SetupServer, setupServer } from "msw/node";
import { createRequest } from "node-mocks-http";
import { jwk, token } from "../__utils__/test-provider";
import azure from "../../src/identity-providers/azure";

describe("getAzureToken", () => {
  let server: SetupServer;
  beforeAll(() => {
    server = setupServer(
      http.get(process.env.AZURE_OPENID_CONFIG_JWKS_URI!, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("handles missing authorization header", async () => {
    expect(await azure(createRequest())).toBeNull();
  });

  it("verifies valid token", async () => {
    const pid = "123123123";

    expect(
      decodeJwt(
        (await azure(
          createRequest({
            headers: {
              authorization: `Bearer ${await token(pid)}`,
            },
          }),
        ))!,
      ).pid,
    ).toBe(pid);
  });

  it("fails verification when issuer is not azure", async () => {
    const verify = async () =>
      azure(
        createRequest({
          headers: {
            authorization: `Bearer ${await token("123123123", {
              issuer: "not azure",
            })}`,
          },
        }),
      );
    expect(verify).rejects.toThrow(errors.JWTClaimValidationFailed);
  });

  it("fails verification when audience is not azure", async () => {
    const verify = async () =>
      azure(
        createRequest({
          headers: {
            authorization: `Bearer ${await token("123123123", {
              audience: "not azure",
            })}`,
          },
        }),
      );
    expect(verify).rejects.toThrow(errors.JWTClaimValidationFailed);
  });
});
