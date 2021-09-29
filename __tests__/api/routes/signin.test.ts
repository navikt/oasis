import { parse } from "cookie";
import signinHandler, {
  IDPORTEN_LOGIN,
  LOGINSERVICE_LOGIN,
} from "../../../lib/api/routes/signin";
import { getSession } from "../../../lib/server";
import { createNextMocks } from "../../__utils__/createNextMocks";
import { gyldigSession } from "../../__utils__/session";

const { SELF_URL } = process.env;

jest.mock("../../../lib/server");
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe("server/routes/signin", () => {
  beforeEach(() => mockGetSession.mockResolvedValue(gyldigSession()));
  afterEach(() => mockGetSession.mockClear());

  test("Redirecter først til /oauth2/login", async () => {
    const { req, res } = createNextMocks();
    mockGetSession.mockResolvedValue({});

    await signinHandler(req, res);

    expect(res._getRedirectUrl()).toBe(IDPORTEN_LOGIN);
  });

  test("Redirecter så til loginservice", async () => {
    const { req, res } = createNextMocks();

    await signinHandler(req, res);

    expect(res._getRedirectUrl()).toBe(LOGINSERVICE_LOGIN);
  });

  test("Redirecter til SELF_URL når innlogget", async () => {
    const { req, res } = createNextMocks({
      cookies: { "selvbetjening-idtoken": "jwt-token" },
    });

    await signinHandler(req, res);

    expect(res._getRedirectUrl()).toBe(SELF_URL);
  });

  test("Lagrer destination i cookie før innlogging", async () => {
    const destination = encodeURIComponent("/foo/bar?query=1");
    const { req, res } = createNextMocks({
      query: { destination },
    });

    await signinHandler(req, res);

    const cookie = cookies(res);
    expect(cookie["destination"]).toEqual(destination);
  });

  test("Redirecter til destination etter ferdig innlogging", async () => {
    const allowedDestination = "/routing?test=med&query=true";
    const destination = allowedDestination + "#/hash";
    const { req, res } = createNextMocks({
      cookies: {
        "selvbetjening-idtoken": "jwt-token",
        destination: encodeURIComponent(destination),
      },
    });

    await signinHandler(req, res);

    const cookie = cookies(res);
    expect(cookie["destination"]).toBe("");
    expect(cookie["Expires"]).toBe(new Date(0).toUTCString());
    expect(res._getRedirectUrl()).toBe(SELF_URL + allowedDestination);
  });

  test("Redirecter ikke til destination etter ferdig innlogging om den ikke er whitelistet", async () => {
    const destination = "/ikke-lov?query=1";
    const { req, res } = createNextMocks({
      cookies: { "selvbetjening-idtoken": "jwt-token", destination },
    });

    mockGetSession.mockResolvedValue(gyldigSession());

    await signinHandler(req, res);

    expect(res._getRedirectUrl()).toBe(SELF_URL);
  });

  test("Redirecter ikke til destination etter ferdig innlogging om den ikke starter med /", async () => {
    const destination = "http://fail.test/ikke-lov?query=1";
    const { req, res } = createNextMocks({
      cookies: { "selvbetjening-idtoken": "jwt-token", destination },
    });

    mockGetSession.mockResolvedValue(gyldigSession());

    await signinHandler(req, res);

    expect(res._getRedirectUrl()).toBe(SELF_URL);
  });
});

function cookies(res) {
  const cookieHeaders = res._getHeaders()["set-cookie"];
  if (typeof cookieHeaders !== "string")
    throw new Error("Set-cookie header må være string");

  return parse(cookieHeaders);
}
