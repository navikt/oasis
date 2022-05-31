import { createRequest } from "node-mocks-http";
import { Request } from "express";
import { NextRequest } from "next/server";
import { token } from "../__utils__/test-provider";
import { idporten } from "../../lib/providers";
import { CtxOrReq, getSession } from "../../lib/server/get-session";

const getIdportenSession = (ctx: CtxOrReq) => getSession(idporten, ctx);

describe("server/getSession()", () => {
  test("returns empty object if authorization header is missing", async () => {
    const req = createNextRequest();
    await expect(getIdportenSession({ req })).rejects.toThrow();
  });

  test("returns empty object if authorization header is not valid", async () => {
    const req = createNextRequest("foo");
    await expect(getIdportenSession({ req })).rejects.toThrow();
  });

  test("returns valid session object if authorization header is valid", async () => {
    const pid = "123";
    const testToken = await token(pid);

    const req = createNextRequest(testToken);
    const session = await getIdportenSession({ req });

    expect(session).toMatchObject({
      apiToken: expect.any(Function),
      user: {
        sub: expect.any(String),
      },
      expires_in: expect.any(Number),
    });
  });

  test("returns valid session object with function to exhange API scoped token", async () => {
    const testToken = await token("123");
    const audience = "test";
    const expectedApiToken = `${audience}:${testToken}`;

    const req = createNextRequest(testToken);
    const { apiToken } = await getIdportenSession({ req });

    if (apiToken) {
      expect(await apiToken(audience)).toBe(expectedApiToken);
    }
  });
});

function createNextRequest(token?: string) {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const request = createRequest<NextRequest & Request>();

  //@ts-ignore
  request.headers = headers;

  return request;
}
