import { decodeJwt, errors } from "jose";
import { HttpResponse, http } from "msw";
import { SetupServer, setupServer } from "msw/node";
import { createRequest } from "node-mocks-http";
import idporten from "../../src/identity-providers/idporten";
import { jwk, token } from "../__utils__/test-provider";

describe("getIdportenToken", () => {
  let server: SetupServer;
  beforeAll(() => {
    server = setupServer(
      http.get(process.env.IDPORTEN_JWKS_URI!, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("handles missing authorization header", async () => {
    expect(await idporten(createRequest())).toBeNull();
  });

  it("verifies valid token", async () => {
    const pid = "123123123";

    expect(
      decodeJwt(
        (await idporten(
          createRequest({
            headers: {
              authorization: `Bearer ${await token(pid)}`,
            },
          }),
        ))!,
      ).pid,
    ).toBe(pid);
  });

  it("fails verification when issuer is not idporten", async () => {
    const verify = async () =>
      idporten(
        createRequest({
          headers: {
            authorization: `Bearer ${await token("123123123", {
              issuer: "not idporten",
            })}`,
          },
        }),
      );
    expect(verify).rejects.toThrow(errors.JWTClaimValidationFailed);
  });

  it("fails verification when audience is not idporten", async () => {
    const verify = async () =>
      idporten(
        createRequest({
          headers: {
            authorization: `Bearer ${await token("123123123", {
              audience: "not idporten",
            })}`,
          },
        }),
      );
    expect(verify).rejects.toThrow(errors.JWTClaimValidationFailed);
  });
});
