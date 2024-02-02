import { OboProvider } from "../../src";
import { token } from "../__utils__/test-provider";
import { withInMemoryCache } from "../../src/obo-providers";
import { mockToken } from "../__utils__/mockToken";

describe("withInMemoryCache", () => {
  it("caches token + audience", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience);
    const cachedProvider = withInMemoryCache(oboProvider);
    const token1 = mockToken();
    const obo1 = await cachedProvider(token1, "audience");
    const obo2 = await cachedProvider(token1, "audience");
    const obo3 = await cachedProvider(mockToken(), "audience");

    expect(obo1).not.toBeNull();
    expect(obo2).not.toBeNull();
    expect(obo1).toEqual(obo2);
    expect(obo3).not.toBeNull();
    expect(obo1).not.toEqual(obo3);
  });

  it("does not cache when expire-time is close to tolerance", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience, { expirationTime: "30s" });
    const cachedProvider = withInMemoryCache(oboProvider, { minExpire: 45 });
    const token1 = mockToken();
    const obo1 = await cachedProvider(token1, "audience");
    const obo2 = await cachedProvider(token1, "audience");

    expect(obo1).not.toEqual(obo2);
  });

  it("does not cache when exchange fails", async () => {
    let calls = 0;
    const oboProvider: OboProvider = async (_, audience) => {
      calls++;
      if (calls > 2) return await token(audience);
      return null;
    };
    const cachedProvider = withInMemoryCache(oboProvider);
    const token2 = mockToken();
    const obo1 = await cachedProvider(token2, "audience");
    const obo2 = await cachedProvider(token2, "audience");
    const obo3 = await cachedProvider(token2, "audience");

    expect(calls).toBe(3);
    expect(obo1).toBe(null);
    expect(obo2).toBe(null);
    expect(obo3).not.toBe(null);
  });

  it("provides callbacks to track cache hit/miss", async () => {
    let hits = 0;
    let misses = 0;
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience);
    const cachedProvider = withInMemoryCache(oboProvider, {
      cacheHit: (token, audience) => hits++,
      cacheMiss: (token, audience) => misses++,
    });
    const cachedToken = mockToken();
    await cachedProvider(cachedToken, "audience");
    await cachedProvider(mockToken(), "audience");
    await cachedProvider(mockToken(), "audience");
    await cachedProvider(cachedToken, "audience");

    expect(hits).toBe(1);
    expect(misses).toBe(3);
  });
});
