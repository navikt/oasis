import { createRequest } from "node-mocks-http";
import { getToken } from "./get-token";

describe("getToken", () => {
  it("echos token", () => {
    expect(getToken("token")).toBe("token");
  });

  it("strips Bearer", () => {
    expect(getToken("Bearer token")).toBe("token");
  });

  it("extracts auth header from IncomingMessage", () => {
    expect(
      getToken(createRequest({ headers: { authorization: "Bearer token" } })),
    ).toBe("token");
  });

  it("extracts auth header from Request", () => {
    expect(
      getToken(
        new Request("localhost:3000", {
          headers: { authorization: "Bearer token" },
        }),
      ),
    ).toBe("token");
  });

  it("extracts auth header from Headers", () => {
    expect(getToken(new Headers({ authorization: "Bearer token" }))).toBe(
      "token",
    );
  });

  it("empty auth header gives null", () => {
    expect(getToken(createRequest())).toBe(null);
  });
});
