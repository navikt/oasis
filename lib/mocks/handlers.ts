import { rest } from "msw";
import { importJWK, jwtVerify } from "jose";
import { jwk } from "../../__tests__/__utils__/test-provider";

export const handlers = [
  rest.get("http://*-provider.test/jwks", async (req, res, ctx) => {
    return res(ctx.json({ keys: [await jwk()] }));
  }),
  rest.post<string>(
    process.env.TOKEN_X_TOKEN_ENDPOINT as string,
    async (req, res, ctx) => {
      const grantRequest = new URLSearchParams(req.body);
      const access_token = `${grantRequest.get("audience")}:${grantRequest.get(
        "subject_token"
      )}`;
      const assertion = <string>grantRequest.get("client_assertion");

      // Verify the client_assertion
      await jwtVerify(
        assertion,
        await importJWK(JSON.parse(process.env.TOKEN_X_PRIVATE_JWK as string))
      );

      return res(
        ctx.json({
          access_token,
          issued_token_type: "urn:ietf:params:oauth:token-type:access_token",
          token_type: "Bearer",
          expires_in: 299,
        })
      );
    }
  ),
];
