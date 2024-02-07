import { token } from "../__utils__/test-provider";
import { decodeJwt } from "../../src";
import tokenX from "../../src/obo-providers/tokenx";
import azureOBO from "../../src/obo-providers/azure";
import { SetupServer, setupServer } from "msw/node";
import { HttpResponse, http } from "msw";

const errorAudience = "error-audience";

describe("tokenX", () => {
  let server: SetupServer;
  beforeAll(() => {
    server = setupServer(mockTokenXTokenEnpoint);
    server.listen();
  });
  afterAll(() => server.close());

  it("returns token when exchanges succeeds", async () => {
    const jwt = await tokenX(await token("pid"), "audience");
    expect(jwt).not.toBeNull();

    const payload = decodeJwt(jwt!);
    expect(payload.iss).toBe("urn:tokenx:dings");
  });
  it("returns null when exchange fails", async () => {
    const jwt = await tokenX(await token("pid"), errorAudience);
    expect(jwt).toBeNull();
  });
});

describe("azure", () => {
  let server: SetupServer;
  beforeAll(() => {
    server = setupServer(mockAzureTokenEndpoint);
    server.listen();
  });
  afterAll(() => server.close());

  it("returns token when exchanges succeeds", async () => {
    const jwt = await azureOBO(await token("pid"), "audience");
    expect(jwt).not.toBeNull();

    const payload = decodeJwt(jwt!);
    expect(payload.iss).toBe("urn:azure:dings");
  });
  it("returns null when exchange fails", async () => {
    const jwt = await azureOBO(await token("pid"), errorAudience);
    expect(jwt).toBeNull();
  });
});

const mockTokenXTokenEnpoint = http.post(
  process.env.TOKEN_X_TOKEN_ENDPOINT!,
  async ({ request }) => {
    const { audience, subject_Token } = Object.fromEntries(
      new URLSearchParams(await request.text())
    );

    return HttpResponse.json(
      audience === errorAudience
        ? {}
        : {
            access_token: await token(subject_Token, {
              issuer: "urn:tokenx:dings",
            }),
          }
    );
  }
);

const mockAzureTokenEndpoint = http.post(
  process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!,
  async ({ request }) => {
    const { scope, assertion } = Object.fromEntries(
      new URLSearchParams(await request.text())
    );

    return HttpResponse.json(
      scope === errorAudience
        ? {}
        : {
            access_token: await token(assertion, {
              issuer: "urn:azure:dings",
            }),
          }
    );
  }
);
