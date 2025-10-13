/** biome-ignore-all lint/style/noNonNullAssertion: Mock server, is fine */

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { jwk, token } from "@/mocks/test-provider";

export const server = setupServer(
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
