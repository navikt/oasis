import { OboProvider } from "../../src";
import { token } from "../__utils__/test-provider";
import { withPrometheus } from "../../src/obo-providers/withPrometheus";
import { MetricValue, register } from "prom-client";

describe("withPrometheus", () => {
  afterEach(() => {
    register.resetMetrics();
  });
  it("measures time spent getting token", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      await token(audience);
    const timedProvider = withPrometheus(oboProvider);
    const obo1 = await timedProvider("token1", "audience");

    // Ensure that the exchange has been counted
    const tokenExchangesCounter = await getPrometheusMetric(
      "oasis_token_exchanges"
    );
    expect(tokenExchangesCounter!.value).toBe(1);
    expect(tokenExchangesCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that the exchange has been timed
    const tokenExchangeDuration = await getPrometheusMetric(
      "oasis_token_exchange_duration_seconds"
    );
    expect(tokenExchangeDuration!.value).toBe(1);
    expect(tokenExchangeDuration!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that no errors in the exchange has been counted
    const tokenExchangeFailures = await getPrometheusMetric(
      "oasis_token_exchange_failures"
    );
    expect(tokenExchangeFailures).toBeNull();

    // Expect an exhanged token
    expect(obo1).not.toBeNull();
    expect(obo1).not.toBe("token1");
  });

  it("measures errors in token exchange", async () => {
    const oboProvider: OboProvider = async (_, audience) => null;
    const timedProvider = withPrometheus(oboProvider);
    const obo1 = await timedProvider("token1", "audience");

    // Ensure that the exchange has been counted
    const tokenExchangesCounter = await getPrometheusMetric(
      "oasis_token_exchanges"
    );
    expect(tokenExchangesCounter!.value).toBe(1);
    expect(tokenExchangesCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that the exchange has been timed
    const tokenExchangeDuration = await getPrometheusMetric(
      "oasis_token_exchange_duration_seconds"
    );
    expect(tokenExchangeDuration!.value).toBe(1);
    expect(tokenExchangeDuration!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that errors in the exchange has been counted
    const tokenExchangeFailures = await getPrometheusMetric(
      "oasis_token_exchange_failures"
    );
    expect(tokenExchangeFailures!.value).toBe(1);
    expect(tokenExchangeFailures!.labels).toMatchObject({
      provider: "oboProvider",
    });

    // Expect no token
    expect(obo1).toBeNull();
    expect(obo1).not.toBe("token1");
  });
});

async function getPrometheusMetric(
  name: string
): Promise<MetricValue<string> | null> {
  const metric = await register.getSingleMetric(name)!.get();

  if (metric.values.length === 0) {
    return null;
  }

  return metric.values[0];
}
