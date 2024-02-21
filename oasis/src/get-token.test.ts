import { createRequest } from "node-mocks-http";
import { getToken } from "./get-token";

describe("getToken", () => {
  it("echos token", () => {
    expect(getToken("token")).toBe("token");
  });

  it("strips Bearer", () => {
    expect(getToken("Bearer token")).toBe("token");
  });

  it("extracts auth header", () => {
    expect(
      getToken(createRequest({ headers: { authorization: "Bearer token" } })),
    ).toBe("token");
  });
});
