import { OboProvider } from "../../lib";
import { token } from "../__utils__/test-provider";
import { withInMemoryCache } from "../../lib/obo-providers/withInMemoryCache";

describe("withInMemoryCache", () => {
  it("caches token + audience", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience);
    const cachedProvider = withInMemoryCache(oboProvider);
    const obo1 = await cachedProvider("token1", "audience");
    const obo2 = await cachedProvider("token1", "audience");
    const obo3 = await cachedProvider("token2", "audience");

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
    const obo1 = await cachedProvider("token3", "audience");
    const obo2 = await cachedProvider("token3", "audience");

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
    const obo1 = await cachedProvider("token3", "audience");
    const obo2 = await cachedProvider("token3", "audience");
    const obo3 = await cachedProvider("token3", "audience");

    expect(calls).toBe(3);
    expect(obo1).toBe(null);
    expect(obo2).toBe(null);
    expect(obo3).not.toBe(null);
  });

  it("provides callbacks to track cache hit/miss", async () => {
    const hits = [];
    const misses = [];
    const audiences = [];
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience);
    const cachedProvider = withInMemoryCache(oboProvider, {
      cacheHit: (token, audience) =>
        hits.push(token) && audiences.push(audience),
      cacheMiss: (token, audience) =>
        misses.push(token) && audiences.push(audience),
    });
    await cachedProvider("token-cache-1", "audience");
    await cachedProvider("token-cache-2", "audience");
    await cachedProvider("token-cache-3", "audience");
    await cachedProvider("token-cache-2", "audience");

    expect(hits).toHaveLength(1);
    expect(misses).toHaveLength(3);
    expect(audiences).toHaveLength(4);
  });
});
