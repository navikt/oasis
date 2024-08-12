import { token } from "../test-provider";
import { withPrometheus } from "./prometheus";
import { MetricValue, MetricValueWithName, register } from "prom-client";
import { OboProvider } from ".";
import { TokenResult } from "../token-result";

describe("withPrometheus", () => {
  afterEach(() => {
    register.resetMetrics();
  });
  it("measures time spent getting token", async () => {
    const oboProvider: OboProvider = async (_, audience) =>
      Promise.resolve(TokenResult.Ok(await token({ audience })));
    const timedProvider = withPrometheus(oboProvider);
    const obo1 = await timedProvider("token1", "audience");

    // Ensure that the exchange has been counted
    const tokenExchangesCounter = await getPrometheusMetric(
      "oasis_token_exchanges",
    );
    expect(tokenExchangesCounter!.value).toBe(1);
    expect(tokenExchangesCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that the exchange has been timed
    const durationCount = (
      await register
        .getSingleMetric("oasis_token_exchange_duration_seconds")!
        .get()
    ).values.find(
      (value: MetricValueWithName<string>) =>
        value.metricName === "oasis_token_exchange_duration_seconds_count",
    )?.value;
    expect(durationCount).toBe(1);
    // Ensure that no errors in the exchange has been counted
    const tokenExchangeFailures = await getPrometheusMetric(
      "oasis_token_exchange_failures",
    );
    expect(tokenExchangeFailures).toBeNull();

    // Expect an exhanged token
    expect(obo1).not.toBeNull();
    expect(obo1).not.toBe("token1");
  });

  it("measures errors in token exchange", async () => {
    const oboProvider: OboProvider = async () =>
      Promise.resolve(TokenResult.Error(""));
    const timedProvider = withPrometheus(oboProvider);
    const obo1 = await timedProvider("token1", "audience");

    // Ensure that the exchange has been counted
    const tokenExchangesCounter = await getPrometheusMetric(
      "oasis_token_exchanges",
    );
    expect(tokenExchangesCounter!.value).toBe(1);
    expect(tokenExchangesCounter!.labels).toMatchObject({
      provider: "oboProvider",
    });
    // Ensure that the exchange has been timed
    const durationCount = (
      await register
        .getSingleMetric("oasis_token_exchange_duration_seconds")!
        .get()
    ).values.find(
      (value: MetricValueWithName<string>) =>
        value.metricName === "oasis_token_exchange_duration_seconds_count",
    )?.value;
    expect(durationCount).toBe(1);
    // Ensure that errors in the exchange has been counted
    const tokenExchangeFailures = await getPrometheusMetric(
      "oasis_token_exchange_failures",
    );
    expect(tokenExchangeFailures!.value).toBe(1);
    expect(tokenExchangeFailures!.labels).toMatchObject({
      provider: "oboProvider",
    });

    // Expect no token
    expect(obo1.ok).toBe(false);
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
