import { afterEach } from "node:test";
import nock from "nock";
import { expect, test } from "vitest";

import { texas } from "./texas";
import type {
  IntrospectRequest,
  IntrospectResponse,
  TokenExchangeRequest,
  TokenExchangeResponse,
  TokenRequest,
  TokenResponse,
} from "./types.gen";

afterEach(clearTexasMockEnv);

test("sanity: correct types, URL and payload for introspection", async () => {
  const env = setTexasMockEnv();

  nock(env.host)
    .post(env.introspection, {
      identity_provider: "tokenx",
      token: "foo-bar-baz",
    } satisfies IntrospectRequest)
    .reply(
      200,
      (): IntrospectResponse => ({
        active: true,
      }),
    );

  const result = await texas.introspect({
    identity_provider: "tokenx",
    token: "foo-bar-baz",
  });

  expect(result.active).toBe(true);
});

test("sanity: correct types, URL and payload for token exchange (OBO)", async () => {
  const env = setTexasMockEnv();

  nock(env.host)
    .post(env.exchange, {
      identity_provider: "azuread",
      target: "dev-gcp:joda:neida",
      user_token: "foo-bar-baz",
    } satisfies TokenExchangeRequest)
    .reply(
      200,
      (): TokenExchangeResponse => ({
        access_token: "obo-token",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    );

  const result = await texas.exchange({
    identity_provider: "azuread",
    target: "dev-gcp:joda:neida",
    user_token: "foo-bar-baz",
  });

  expect(result.access_token).toBe("obo-token");
});

test("sanity: correct types, URL and payload for token request (M2M)", async () => {
  const env = setTexasMockEnv();

  nock(env.host)
    .post(env.token, {
      identity_provider: "azuread",
      target: `api://dev-gcp.my-app.namespace/.default`,
    } satisfies TokenRequest)
    .reply(
      200,
      (): TokenResponse => ({
        access_token: "obo-token",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    );

  const result = await texas.token({
    identity_provider: "azuread",
    target: `api://dev-gcp.my-app.namespace/.default`,
  });

  expect(result.access_token).toBe("obo-token");
});

function setTexasMockEnv(): {
  host: string;
  introspection: string;
  exchange: string;
  token: string;
} {
  process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT =
    "http://texas/api/v1/introspect";
  process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT =
    "http://texas/api/v1/token/exchange";
  process.env.NAIS_TOKEN_ENDPOINT = "http://texas/api/v1/token";

  return {
    host: "http://texas",
    introspection: "/api/v1/introspect",
    exchange: "/api/v1/token/exchange",
    token: "/api/v1/token",
  };
}

function clearTexasMockEnv() {
  delete process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT;
  delete process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT;
  delete process.env.NAIS_TOKEN_ENDPOINT;
}
