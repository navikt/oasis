import { decodeJwt, makeSession, OboProvider } from "../src";
import { createRequest } from "node-mocks-http";
import { token } from "./__utils__/test-provider";
import idporten from "../src/identity-providers/idporten";
import tokenX from "../src/obo-providers/tokenx";
import { withInMemoryCache } from "../src/obo-providers/withInMemoryCache";

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
  it("can be destructured", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
    });
    const { token, expiresIn } = (await getSession(createRequest())) || {};
    expect(token).toBeUndefined();
    expect(expiresIn).toBeUndefined();
  });
  it("can be composed without OBO", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }),
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);
    // @ts-ignore
    expect(session?.apiToken).toBeUndefined();
  });

  it("can be composed with OBO", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
      oboProvider: tokenX,
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }),
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);
    const oboToken = decodeJwt(await session?.apiToken("fo"));
    expect(oboToken.iss).toBe(`urn:tokenx:dings`);
  });

  it("can be composed with caching of OBO tokens", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
      oboProvider: withInMemoryCache(tokenX),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }),
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.apiToken("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });

  it("can be composed with metrics and caching of OBO exchange", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
      oboProvider: withMetrics(withInMemoryCache(tokenX)),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }),
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.apiToken("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });

  it("can be composed with metrics and caching of OBO exchange depending of what you want to measure", async () => {
    const getSession = makeSession({
      identityProvider: idporten,
      oboProvider: withInMemoryCache(withMetrics(tokenX)),
    });
    const jwt = await token("123");
    const session = await getSession(
      createRequest({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }),
    );
    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.apiToken("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });
});
