import { createRequest } from "node-mocks-http";
import { token } from "../__utils__/test-provider";
import { decodeJwt } from "jose";
import idporten from "../../lib/identity-providers/idporten";

describe("getIdportenToken", () => {
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
});
