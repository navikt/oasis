/** biome-ignore-all lint/style/noNonNullAssertion: Mock server, is fine */

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { createTestToken } from "@/mocks/jwt";

export const server = setupServer(
  http.post(process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT!, async () => {
    console.log("Mocking introspection endpoint");
    return HttpResponse.json(
      {
        active: true,
        aud: "my-target",
        azp: "yolo",
        exp: 1730980893,
        iat: 1730977293,
        iss: "http://localhost:8080/tokenx",
        jti: "e7cbadc3-6bda-49c0-a196-c47328da880e",
        nbf: 1730977293,
        sub: "e015542c-0f81-40f5-bbd9-7c3d9366298f",
        tid: "tokenx",
      },
      { status: 200 },
    );
  }),
  http.post(process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT!, async () => {
    console.log("Mocking exchange (obo) endpoint");
    return HttpResponse.json(
      {
        access_token: await createTestToken("123456", {
          issuer: "http://localhost:8080/tokenx",
        }),
        expires_in: 3599,
        token_type: "Bearer",
      },
      { status: 200 },
    );
  }),
  http.post(process.env.NAIS_TOKEN_ENDPOINT!, async () => {
    console.log("Mocking token endpoint");
    return HttpResponse.json({ error: "what" }, { status: 400 });
  }),
);
