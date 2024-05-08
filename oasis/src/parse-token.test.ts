import { parseAzureUserToken, parseIdportenToken } from "./parse-token";
import { token } from "./test-provider";
import { expectNotOK, expectOK } from "./test-expect";

describe("parseIdportenToken", () => {
  it("should return pid", async () => {
    const res = parseIdportenToken(
      await token({
        pid: "real-pid",
      }),
    );

    expectOK(res);
    expect(res.pid).toBe("real-pid");
  });

  it("should not be OK when pid is missing", async () => {
    const res = parseIdportenToken(
      await token({
        pid: null,
      }),
    );

    expectNotOK(res);
    expect(res.error.message).toEqual("Missing PID");
  });

  it("should handle PID not being a string", async () => {
    const res = parseIdportenToken(
      await token({
        pid: 69,
      }),
    );

    expectNotOK(res);
    expect(res.error.message).toEqual("PID is not a string");
  });

  it("should return error when parsing fails", async () => {
    const res = parseIdportenToken("foo-bar");

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid JWT");
  });
});

describe("parseAzureUserToken", () => {
  it("should return expected values in NAVIdent", async () => {
    const res = parseAzureUserToken(
      await token({
        NAVIdent: "navident",
        preferred_username: "username",
        name: "name",
      }),
    );

    expectOK(res);
    expect(res.name).toBe("name");
    expect(res.NAVIdent).toBe("navident");
    expect(res.preferred_username).toBe("username");
  });

  it("should not be OK when navident missing", async () => {
    const res = parseAzureUserToken(
      await token({
        preferred_username: "username",
        name: "name",
      }),
    );

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid or missing values in token");
  });

  it("should not be OK when values are missing", async () => {
    const res = parseAzureUserToken(
      await token({
        name: "name",
      }),
    );

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid or missing values in token");
  });

  it("should return error when parsing fails", async () => {
    const res = parseAzureUserToken("foo-bar");

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid JWT");
  });
});
