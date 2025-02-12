import { isLoginLevelHigh } from "./login-level";
import { token } from "./test-provider";
import { expiresIn } from "./expires-in";

describe("login level", () => {
  it ("should return true for high login level", async () => {
    const res = isLoginLevelHigh(await token({ acr: "idporten-loa-high" }));
    expect(res).toBe(true);
  });

  it("should return false for substantial login level", async () => {
    const res = isLoginLevelHigh(await token({ acr: "idporten-loa-substantial" }));
    expect(res).toBe(false);
  });

  it("throws error for invalid token", async () => {
    expect(() => expiresIn("")).toThrow();
  });

  it("throws error for token without acr", async () => {
    await expect(async () => isLoginLevelHigh(await token())).rejects.toThrow();
  });
});
