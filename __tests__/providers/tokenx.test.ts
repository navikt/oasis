import { server } from "../../__mocks__/server";
import { rest } from "msw";
import { generateKeyPair } from "jose/util/generate_key_pair";
import { getToken } from "../../lib/providers/tokenx";
import { exportJWK } from "jose/key/export";
import { RequestError } from "got";
import { errors } from "openid-client";

const OPError = errors.OPError;
const { TOKEN_X_WELL_KNOWN_URL } = process.env;

describe("provider/tokenx/getToken()", () => {
  const token_endpoint = "http://tokenx.test/token";

  let consoleErrorMock;

  beforeAll(async () => {
    process.env.TOKEN_X_PRIVATE_JWK = JSON.stringify(
      await exportJWK((await generateKeyPair("RS256")).privateKey)
    );

    server.use(
      rest.get(TOKEN_X_WELL_KNOWN_URL, (req, res, ctx) =>
        res.once(
          ctx.json({
            issuer: "urn:example:issuer",
            jwks_uri: "http://tokenx.test/jwks",
            token_endpoint: token_endpoint,
            token_endpoint_auth_signing_alg_values_supported: [
              "private_key_jwt",
            ],
          })
        )
      )
    );

    consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorMock.mockClear();
  });

  test("returnerer API token", async () => {
    const audience = "api audience";
    const subjectToken = "token";
    const access_token = "eyJraWQiOi..............";

    server.use(
      rest.post(token_endpoint, (req, res, ctx) => {
        const body = new URLSearchParams(req.body as string);
        expect(body.get("audience")).toBe(audience);
        expect(body.get("subject_token")).toBe(subjectToken);

        return res(
          ctx.json({
            access_token,
            issued_token_type: "urn:ietf:params:oauth:token-type:access_token",
            token_type: "Bearer",
            expires_in: 299,
          })
        );
      })
    );
    const apiToken = await getToken(subjectToken, audience);

    expect(apiToken).toBe(access_token);
  });

  test("kaster RequestError når det er nettverksfeil", async () => {
    server.use(
      rest.post(token_endpoint, (req, res, ctx) => {
        return res.networkError("Failed to connect");
      })
    );

    await expect(getToken("token", "api audience")).rejects.toThrow(
      RequestError
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Kunne ikke koble til TokenX"),
      expect.any(RequestError)
    );
  });

  test("kaster OPError når det er feil i token utvekslingen", async () => {
    server.use(
      rest.post(token_endpoint, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            feilmelding: "foo",
          })
        );
      })
    );

    await expect(getToken("token", "api audience")).rejects.toThrow(OPError);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Noe gikk galt med token exchange"),
      expect.anything()
    );
  });
});
