import { describe, expect, it } from "vitest";
import { token } from "../test-provider";
import { withCache } from ".";
import { TokenResult } from "../token-result";
import { type OboProvider } from "../obo";

describe("withCache", () => {
  it("measures cache hits", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      Promise.resolve(TokenResult.Ok(await token({ audience })));
    const cacheProvider = withCache(oboProvider);
    const obo1 = await cacheProvider("token1", "audience");

    // Expect an exhanged token
    expect(obo1).not.toBeNull();
    expect(obo1).not.toBe("token1");

    const obo2 = await cacheProvider("token1", "audience");

    // Expect an exhanged token
    expect(obo2).not.toBeNull();
    expect(obo2).not.toBe("token1");
  });
});
