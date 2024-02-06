import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { jwk, token } from "./test-provider";

export const server = setupServer(
  http.get(
    "http://*-provider.test/jwks",
    async () => HttpResponse.json({ keys: [await jwk()] }),
    { once: true }
  ),
  http.post(process.env.TOKEN_X_TOKEN_ENDPOINT!, async ({ request }) => {
    const { audience, subject_Token } = Object.fromEntries(
      new URLSearchParams(await request.text())
    );

    return HttpResponse.json(
      audience === "error-audience"
        ? {}
        : {
            access_token: await token(subject_Token, {
              issuer: "urn:tokenx:dings",
            }),
          }
    );
  }),
  http.post(
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!,
    async ({ request }) => {
      const { scope, assertion } = Object.fromEntries(
        new URLSearchParams(await request.text())
      );

      return HttpResponse.json(
        scope === "error-audience"
          ? {}
          : {
              access_token: await token(assertion, {
                issuer: "urn:azure:dings",
              }),
            }
      );
    }
  )
);
