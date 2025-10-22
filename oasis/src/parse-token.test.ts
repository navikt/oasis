import { describe, expect, it } from "vitest";

import { parseAzureUserToken, parseIdportenToken } from "./parse-token";
import { expectNotOK, expectOK } from "./test-utils/test-expect";
import { token } from "./test-utils/test-provider";

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

  it("should handle PID not being a string", async () => {
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
        groups: ["group1", "group2"],
      }),
    );

    expectOK(res);
    expect(res.name).toBe("name");
    expect(res.NAVident).toBe("navident");
    expect(res.preferred_username).toBe("username");
    expect(res.groups).toEqual(["group1", "group2"]);
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
