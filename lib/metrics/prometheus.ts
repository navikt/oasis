import { collectDefaultMetrics, Counter, Histogram } from "prom-client";

declare global {
  // eslint-disable-next-line no-var
  var _metrics: AuthMetrics;
}

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

global._metrics = global._metrics || new AuthMetrics();

export default global._metrics;
