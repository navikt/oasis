import { token } from "../test-provider";
import { MetricValue, register } from "prom-client";
import { withCache } from ".";
import { TokenResult } from "../token-result";
import { OboProvider } from "../obo";

describe("withCache", () => {
  afterEach(() => {
    register.resetMetrics();
  });
  it("measures cache hits", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      Promise.resolve(TokenResult.Ok(await token({ audience })));
    const cacheProvider = withCache(oboProvider);
    const obo1 = await cacheProvider("token1", "audience");

    // Ensure that the cache miss has been counted
    const cacheMissCounter = await getPrometheusMetric(
      "oasis_cache_misses_total",
    );
    expect(cacheMissCounter!.value).toBe(1);
    expect(cacheMissCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });

    // Expect an exhanged token
    expect(obo1).not.toBeNull();
    expect(obo1).not.toBe("token1");

    const obo2 = await cacheProvider("token1", "audience");
    // Ensure that the cache hit has been counted
    const cacheHitCounter = await getPrometheusMetric("oasis_cache_hits_total");
    expect(cacheHitCounter!.value).toBe(1);
    expect(cacheHitCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });

    // Expect an exhanged token
    expect(obo2).not.toBeNull();
    expect(obo2).not.toBe("token1");
  });
});

async function getPrometheusMetric(
  name: string,
): Promise<MetricValue<string> | null> {
  const metric = await register.getSingleMetric(name)!.get();

  if (metric.values.length === 0) {
    return null;
  }

  return metric.values[0];
}
