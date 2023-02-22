import { getTokenFromHeader } from "../../lib/utils/getTokenFromHeader";
import { IncomingHttpHeaders } from "http";

describe("getTokenFromHeader", () => {
  it("handles missing authorization header", () => {
    const headers: IncomingHttpHeaders = {};
    expect(getTokenFromHeader(headers)).toBeNull();
  });

  it("extracts from authorization header", () => {
    const headers: IncomingHttpHeaders = { authorization: "Bearer jwt" };
    expect(getTokenFromHeader(headers)).toBe("jwt");
  });

  it("extracts from authorization header for a Fetch Request type", () => {
    const headers: Headers = new Headers({ authorization: "Bearer jwt" });
    expect(getTokenFromHeader(headers)).toBe("jwt");
  });
});
