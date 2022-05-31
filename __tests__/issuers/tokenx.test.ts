import { rest } from "msw";
import { getToken } from "../../lib/issuers/tokenx";
import { errors } from "openid-client";
import { server } from "../../lib/mocks/server";

describe("issuers/tokenx/getToken()", () => {
  const token_endpoint = <string>process.env.TOKEN_X_TOKEN_ENDPOINT;

  test("returns API token", async () => {
    const audience = "api audience";
    const subjectToken = "token";
    const access_token = `${audience}:${subjectToken}`;

    const apiToken = await getToken(subjectToken, audience);

    expect(apiToken).toBe(access_token);
  });

  test("throws exception when network is down", async () => {
    server.use(
      rest.post(token_endpoint, (req, res, ctx) => {
        return res.networkError("Failed to connect");
      })
    );

    await expect(getToken("token", "api audience")).rejects.toThrow();
  });

  test("throws OPError for domain errors in the exchange", async () => {
    server.use(
      rest.post(token_endpoint, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            feilmelding: "foo"
          })
        );
      })
    );

    await expect(getToken("token", "api audience")).rejects.toThrow(errors.OPError);
  });
});
