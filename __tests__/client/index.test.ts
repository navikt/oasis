import { createRequest } from "node-mocks-http";
import { NextApiRequest } from "next";
import { Request } from "express";
import { getSession } from "../../lib/client";
import { validerToken } from "../../lib/providers/idporten";
import { getToken } from "../../lib/providers/tokenx";

jest.mock("../../lib/providers/idporten");
jest.mock("../../lib/providers/tokenx");

const mockValider = validerToken as jest.MockedFunction<typeof validerToken>;
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

afterEach(() => {
  mockValider.mockClear();
});

describe("getSession()", () => {
  test("returns empty object if authorization header is missing", async () => {
    const req = createRequest<NextApiRequest & Request>();
    const session = await getSession({ req });

    expect(session).toEqual({});
  });

  test("returns empty object if authorization header does not validate", async () => {
    mockValider.mockResolvedValue({
      payload: undefined,
      protectedHeader: undefined,
      key: undefined,
    });

    const req = createRequest<NextApiRequest & Request>({
      headers: {
        authorization: "Bearer foo",
      },
    });
    const session = await getSession({ req });

    expect(session).toEqual({});
  });

  test("returns session object if authorization header does validate", async () => {
    const pid = "123";
    const token = "foo";

    mockValider.mockResolvedValue({
      payload: { pid },
      protectedHeader: { alg: "rsa" },
      key: undefined,
    });

    const req = createRequest<NextApiRequest & Request>({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const session = await getSession({ req });

    expect(session).toMatchObject({
      apiToken: expect.any(Function),
      payload: {
        pid,
      },
      token,
    });
  });

  test("returns session object with function for getting API token", async () => {
    const pid = "123";
    const token = "foo";
    const audience = "test";
    const expectedApiToken = `${audience}:${token}`;

    mockValider.mockResolvedValue({
      payload: { pid },
      protectedHeader: { alg: "rsa" },
      key: undefined,
    });

    mockGetToken.mockResolvedValue(expectedApiToken);

    const req = createRequest<NextApiRequest & Request>({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const { apiToken } = await getSession({ req });

    expect(await apiToken(audience)).toBe(expectedApiToken);
  });
});
