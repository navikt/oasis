import { createNextMocks } from "../__utils__/createNextMocks";
import * as routes from "../../lib/api/routes";

import DpAuthHandler from "../../lib/api";

jest.mock("../../lib/api/routes");

describe("server/[...auth].ts", () => {
  test("Sjekker at fila heter [...auth].(ts|js)", async () => {
    jest.spyOn(console, "error").mockImplementation();
    const { req, res } = createNextMocks();

    await DpAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toMatch("[...auth]");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[...auth]")
    );
  });

  test("Gir 400 med ukjent route ", async () => {
    const { req, res } = createNextMocks({
      query: {
        auth: ["ukjent-route"],
      },
    });

    await DpAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch("ikke støttet");
  });

  test("Gir 400 med ukjent metode", async () => {
    const { req, res } = createNextMocks({
      method: "POST",
      query: {
        auth: ["signin"],
      },
    });

    await DpAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch("ikke støttet");
  });

  test("router riktig til /session/", async () => {
    const { req, res } = createNextMocks({
      query: {
        auth: ["session"],
      },
    });

    await DpAuthHandler(req, res);

    expect(routes.session).toHaveBeenCalled();
  });

  test("router riktig til /signin/", async () => {
    const { req, res } = createNextMocks({
      query: {
        auth: ["signin"],
      },
    });

    await DpAuthHandler(req, res);

    expect(routes.signin).toHaveBeenCalled();
  });
});
