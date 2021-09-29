import { getSession } from "../../../lib/server";
import sessionHandler from "../../../lib/api/routes/session";
import { createNextMocks } from "../../__utils__/createNextMocks";

jest.mock("../../../lib/server");
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe("server/routes/session", () => {
  afterEach(() => mockGetSession.mockClear());

  test("Gir 401 og tom body om ikke innlogget", async () => {
    const { req, res } = createNextMocks();
    mockGetSession.mockResolvedValue({});

    await sessionHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getData()).toBe("");
  });

  test("Gir 200 og JSON om innlogget", async () => {
    const { req, res } = createNextMocks();
    mockGetSession.mockResolvedValue({
      token: "123",
      payload: { exp: Date.now() / 1000 + 3000 },
    });

    await sessionHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      expires_in: expect.any(Number),
    });
  });
});
