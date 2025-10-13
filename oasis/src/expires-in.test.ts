import { describe, expect, it } from "vitest";
import { expiresIn } from "./expires-in";
import { token, tokenWithoutExp } from "./test-provider";

describe("expires in", () => {
  it("exposes time until exp", async () => {
    const timeUtil = expiresIn(await token({ exp: "1 minute" }));
    expect(timeUtil).toBeLessThanOrEqual(60);
    expect(timeUtil).toBeGreaterThan(50);
  });

  it("throws error for invalid token", async () => {
    expect(() => expiresIn("")).toThrow();
  });

  it("throws error for token without exp", async () => {
    await expect(async () =>
      expiresIn(await tokenWithoutExp()),
    ).rejects.toThrow();
  });
});
