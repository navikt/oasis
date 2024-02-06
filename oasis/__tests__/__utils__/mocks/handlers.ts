import { http, HttpResponse } from "msw";
import { importJWK, jwtVerify } from "jose";
import { jwk, token } from "../test-provider";

export const errorAudience = "error-audience";

export const handlers = [
  http.get(
    "http://*-provider.test/jwks",
    async () => {
      return HttpResponse.json({ keys: [await jwk()] });
    },
    { once: true }
  ),
  http.post(
    process.env.TOKEN_X_TOKEN_ENDPOINT as string,
    async ({ request }) => {
      const grantRequest = new URLSearchParams(await request.text());
      const assertion = <string>grantRequest.get("client_assertion");

      if (grantRequest.get("audience") == errorAudience) {
        return HttpResponse.json({});
      }
      // Verify the client_assertion
      await jwtVerify(
        assertion,
        await importJWK(JSON.parse(process.env.TOKEN_X_PRIVATE_JWK as string))
      );

      const access_token = await token(
        grantRequest.get("subject_Token") as string,
        {
          issuer: "urn:tokenx:dings",
        }
      );

      return HttpResponse.json({
        access_token,
        issued_token_type: "urn:ietf:params:oauth:token-type:access_token",
        token_type: "Bearer",
        expires_in: 299,
      });
    }
  ),
  http.post(
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT as string,
    async ({ request }) => {
      const grantRequest = new URLSearchParams(await request.text());
      const assertion = <string>grantRequest.get("assertion");

      if (grantRequest.get("scope") == errorAudience) {
        return HttpResponse.json({});
      }

      // Verify the client_assertion
      await jwtVerify(
        assertion,
        await importJWK(
          JSON.parse(process.env.AZURE_APP_JWK as string),
          "RS256"
        )
      );

      const access_token = await token(
        grantRequest.get("assertion") as string,
        {
          issuer: "urn:azure:dings",
        }
      );

      return HttpResponse.json({
        access_token,
        issued_token_type: "urn:ietf:params:oauth:token-type:access_token",
        token_type: "Bearer",
        expires_in: 299,
      });
    }
  ),
];
