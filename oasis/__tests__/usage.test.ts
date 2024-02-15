import { decodeJwt, makeSession, OboProvider } from "../src";
import { createRequest } from "node-mocks-http";
import { jwk, token } from "./__utils__/test-provider";
import idporten from "../src/identity-providers/idporten";
import tokenX from "../src/obo-providers/tokenx";
import { withInMemoryCache } from "../src/obo-providers/withInMemoryCache";
import { setupServer, SetupServer } from "msw/node";
import { http, HttpResponse } from "msw";

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
  let server: SetupServer;
  beforeAll(() => {
    server = setupServer(
      http.get(process.env.IDPORTEN_JWKS_URI!, async () =>
        HttpResponse.json({ keys: [await jwk()] }),
      ),
      http.post(process.env.TOKEN_X_TOKEN_ENDPOINT!, async ({ request }) =>
        HttpResponse.json({
          access_token: await token(
            new URLSearchParams(await request.text()).get("subject_Token")!,
            { issuer: "urn:tokenx:dings" },
          ),
        }),
      ),
    );
    server.listen();
  });
  afterAll(() => server.close());

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
    // @ts-expect-error expect no apiToken
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

  it("can be initalized with a custom identity provider that infers type", async () => {
    type RequestContext = {
      foo: string;
    };

    const getDataLoaderSession = makeSession({
      identityProvider: (context: RequestContext) => idporten(context.foo),
      oboProvider: withInMemoryCache(withMetrics(tokenX)),
    });

    // This should also infer types correctly
    makeSession<RequestContext>({
      identityProvider: (context) => idporten(context.foo),
      oboProvider: withInMemoryCache(withMetrics(tokenX)),
    });

    const jwt = await token("123");
    const session = await getDataLoaderSession({
      foo: jwt,
    });

    expect(session).not.toBeNull();
    expect(session?.token).toBe(jwt);
    expect(session?.expiresIn).toBeGreaterThanOrEqual(600);

    const oboToken = await session?.apiToken("fo");
    const payload = decodeJwt(oboToken);
    expect(payload.iss).toContain(`urn:tokenx:dings`);
  });
});
