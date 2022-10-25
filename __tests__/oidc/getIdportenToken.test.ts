import { getIdportenToken } from "../../lib/oidc/getIdportenToken";
import { createRequest } from "node-mocks-http";
import { token } from "../__utils__/test-provider";
import { decodeJwt } from "jose";

describe("getIdportenToken", () => {
  it("handles missing authorization header", async () => {
    expect(await getIdportenToken(createRequest())).toBeNull();
  });

  it("verifies token", async () => {
    const jwt = await token("123123123");
    const actual = await getIdportenToken(
      createRequest({ headers: { authorization: `Bearer ${jwt}` } })
    );
    expect(actual).not.toBeNull();
    const payload = decodeJwt(actual!);
    expect(payload.pid).toBe("123123123");
    expect(payload.iss).toBe(process.env.IDPORTEN_ISSUER);
  });
});
