import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Request } from "express";
import { createRequest, RequestOptions } from "node-mocks-http";
import { NextURL } from "next/dist/server/web/next-url";
import { azureAd, idporten } from "../../lib/providers";
import createAuthMiddleware from "../../lib/server/middleware";
import { token } from "../__utils__/test-provider";
import { isEnforcedPath } from "../../lib/server/url";

describe.each([
  ["Azure AD", azureAd],
  ["ID-porten", idporten],
  //["Loginservice", loginservice],
])("middleware configured with %s", (_, provider) => {
  test("does not enforce auth", async () => {
    const middleware = createAuthMiddleware({
      enforceAuth: false,
      notEnforcedPaths: [],
      provider,
    });

    const req = createNextRequest();
    // @ts-ignore
    const response = await middleware(req, null);
    expect(response).toBeNull();
  });

  test("does not enforce auth for certain URLs", async () => {
    const middleware = createAuthMiddleware({
      enforceAuth: true,
      notEnforcedPaths: ["/test"],
      provider,
    });

    const req = createNextRequest("", { path: "/test" });
    // @ts-ignore
    const response = await middleware(req, null);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response!.status).toBe(200);
  });

  test("enforces auth by redirect to login", async () => {
    const middleware = createAuthMiddleware({
      enforceAuth: true,
      notEnforcedPaths: [],
      provider,
    });

    const req = createNextRequest();
    // @ts-ignore
    const response = await middleware(req, null);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response!.status).toBe(307);
    expect(response!.headers.get("Location")).toContain("/oauth2/login");
  });

  test("enforces auth for APIs with a 401", async () => {
    const middleware = createAuthMiddleware({
      enforceAuth: true,
      notEnforcedPaths: [],
      provider,
    });

    const req = createNextRequest(undefined, { path: "/api/foobar" });
    // @ts-ignore
    const response = await middleware(req, null);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response!.status).toBe(401);
    expect(response!.headers.get("Location")).toContain("/oauth2/login");
  });

  test("enforces auth by allowing authenticated requests", async () => {
    const middleware = createAuthMiddleware({
      enforceAuth: true,
      notEnforcedPaths: [],
      provider,
    });

    const req = createNextRequest(await token("123"));
    // @ts-ignore
    const response = await middleware(req, null);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response!.status).toBe(200);
  });

  test("isEnforced", () => {
    const free = [
      "/_next",
      "/api/isalive",
      "/api/isready",
      "/",
      "/open",
      "/oauth2/login",
    ];
    const foo = ["/_next", "/api/isalive", "/api/isready"];

    const isEnforced = (path: string, paths: string[]) =>
      isEnforcedPath({ nextUrl: { pathname: path } } as NextRequest, paths);

    expect(isEnforced("/", free)).toBeFalsy();
    expect(isEnforced("/open", free)).toBeFalsy();
    expect(isEnforced("/open/bar", free)).toBeFalsy();
    expect(isEnforced("/closed", free)).toBeTruthy();
    expect(isEnforced("/closed/bar", free)).toBeTruthy();

    expect(isEnforced("/", foo)).toBeTruthy();
    expect(isEnforced("/closed", foo)).toBeTruthy();
  });
});

function createNextRequest(token?: string, options?: RequestOptions) {
  const defaults = { url: "http://localhost" };
  const url = options?.url || defaults.url;
  const headers = new Headers(
    token ? { authorization: `Bearer ${token}` } : {}
  );
  const nextUrl = new NextURL(url + (options?.path || ""));
  const request = createRequest<NextRequest & Request>({
    nextUrl,
    ...defaults,
    ...options,
  });

  //@ts-ignore
  request.headers = headers;

  return request;
}
