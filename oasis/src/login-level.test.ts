import { describe, expect, it } from "vitest";
import { isIdportenLoginLevel } from "./login-level";
import { token } from "./test-provider";

describe("login level", () => {
  it("should return true for login level High when acr is idporten-loa-high", async () => {
    const res = isIdportenLoginLevel(
      "High",
      await token({ acr: "idporten-loa-high" }),
    );
    expect(res).toBe(true);
  });

  it("should return false for login level High when acr is idporten-loa-substantial", async () => {
    const res = isIdportenLoginLevel(
      "High",
      await token({ acr: "idporten-loa-substantial" }),
    );
    expect(res).toBe(false);
  });

  it("should return true for login level Substantial when acr is idporten-loa-high", async () => {
    const res = isIdportenLoginLevel(
      "Substantial",
      await token({ acr: "idporten-loa-substantial" }),
    );
    expect(res).toBe(true);
  });

  it("should return false for login level Substantial when acr is idporten-loa-substantial", async () => {
    const res = isIdportenLoginLevel(
      "Substantial",
      await token({ acr: "idporten-loa-high" }),
    );
    expect(res).toBe(false);
  });

  it("throws error for invalid token", async () => {
    expect(() => isIdportenLoginLevel("High", "")).toThrow();
  });

  it("throws error for token without acr", async () => {
    await expect(async () =>
      isIdportenLoginLevel("High", await token()),
    ).rejects.toThrow();
  });
});
