import { parseAzureUserToken, parseIdportenToken } from "./parse-token";
import { token } from "./test-provider";
import { expectNotOK, expectOK } from "./test-expect";

describe("parseIdportenToken", () => {
  it("should return pid and acr", async () => {
    const res = parseIdportenToken(
      await token({
        pid: "real-pid",
        acr: "acr",
      }),
    );

    expectOK(res);
    expect(res.pid).toBe("real-pid");
    expect(res.acr).toBe("acr");
  });

  it("should not be ok when payload is invalid", async () => {
    const res = parseIdportenToken(await token());

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid or missing values in token");
  });

  it("should return error when parsing fails", async () => {
    const res = parseIdportenToken("foo-bar");

    expectNotOK(res);
    expect(res.error.message).toEqual("Invalid JWT");
  });
});

describe("parseAzureUserToken", () => {
  it("should return expected values in NAVident", async () => {
    const res = parseAzureUserToken(
      await token({
        NAVident: "navident",
        preferred_username: "username",
        name: "name",
      }),
    );

    expectOK(res);
    expect(res.name).toBe("name");
    expect(res.NAVident).toBe("navident");
    expect(res.preferred_username).toBe("username");
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
