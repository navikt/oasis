import { decodeJwt, makeSession, OboProvider } from "../lib";
import { createRequest } from "node-mocks-http";
import { getIdportenToken } from "../lib/oidc/getIdportenToken";
import { withInMemoryCache } from "../lib/obo/withInMemoryCache";
import getTokenXOBO from "../lib/obo/tokenx";
import { token } from "./__utils__/test-provider";

// Example function for solving metrics
function withMetrics(oboProvider: OboProvider): OboProvider {
  return async (token, audience) => {
    const stopMeasure = jest.fn();
    const oboToken = (await oboProvider(token, audience)) + "-instrumented";
    stopMeasure();
    return oboToken;
  };
}

describe("getSession", () => {
  it("can be composed without OBO", async () => {
    const getSession = makeSession({
      identityProvider: getIdportenToken,
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);
    // @ts-ignore
    expect(session?.getTokenFor).toBeUndefined();
  });

  it("can be composed with OBO", async () => {
    const getSession = makeSession({
      identityProvider: getIdportenToken,
      oboProvider: getTokenXOBO,
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);
    const oboToken = decodeJwt(await session?.getTokenFor("fo"));
    expect(oboToken.iss).toBe(`urn:tokenx:dings`);
  });

  it("can be composed with caching of OBO tokens", async () => {
    const getSession = makeSession({
      identityProvider: getIdportenToken,
      oboProvider: withInMemoryCache(getTokenXOBO),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.getTokenFor("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });

  it("can be composed with metrics and caching of OBO exchange", async () => {
    const getSession = makeSession({
      identityProvider: getIdportenToken,
      oboProvider: withMetrics(withInMemoryCache(getTokenXOBO)),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.getTokenFor("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });

  it("can be composed with metrics and caching of OBO exchange depending of what you want to measure", async () => {
    const getSession = makeSession({
      identityProvider: getIdportenToken,
      oboProvider: withInMemoryCache(withMetrics(getTokenXOBO)),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.getTokenFor("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });
});
