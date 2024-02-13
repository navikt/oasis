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
        HttpResponse.json({ keys: [await jwk()] })
      )
    );
    server.listen();
  });

  afterAll(() => server.close());

  it("handles missing authorization header", async () => {
    expect(await idporten(createRequest())).toBeNull();
  });

  it("verifies token", async () => {
    const jwt = await token("123123123");
    const actual = await idporten(
      createRequest({ headers: { authorization: `Bearer ${jwt}` } })
    );
    expect(actual).not.toBeNull();
    const payload = decodeJwt(actual!);
    expect(payload.pid).toBe("123123123");
    expect(payload.iss).toBe(process.env.IDPORTEN_ISSUER);
  });

  it("fails verification when issuer is not IDPORTEN_ISSUER", async () => {
    const jwt = await token("123123123", { issuer: "the issuer" });
    const verify = async () =>
      await idporten(
        createRequest({ headers: { authorization: `Bearer ${jwt}` } })
      );
    expect(verify).rejects.toThrow(errors.JWTClaimValidationFailed);
  });
});
