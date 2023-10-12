import { collectDefaultMetrics, Counter, Histogram } from "prom-client";

export class AuthMetrics {
  constructor() {
    collectDefaultMetrics();
  }

  public tokenExchangeDurationHistogram = new Histogram({
    name: "dp_auth_token_exchange_duration_seconds",
    help: "Duration of token exchange in seconds",
    labelNames: ["provider"],
  });
  public tokenExchangeFailures = new Counter({
    name: "dp_auth_token_exchange_failures",
    help: "Number of failed token exchanges",
    labelNames: ["provider"],
  });
  public tokenExchanges = new Counter({
    name: "dp_auth_token_exchanges",
    help: "Number of token exchanges",
    labelNames: ["provider"],
  });
}

const authMetricsSymbol: unique symbol = Symbol.for("AuthMetrics");

type AuthMetricsGlobal = typeof global & {
  [authMetricsSymbol]: AuthMetrics;
};

(global as AuthMetricsGlobal)[authMetricsSymbol] =
  (global as AuthMetricsGlobal)[authMetricsSymbol] || new AuthMetrics();

export default (global as AuthMetricsGlobal)[authMetricsSymbol];
