import type { IdentityProvider } from "@navikt/texas";
import { Counter, Histogram } from "prom-client";

import type { InternalOboProvider } from "./exchange";

export class AuthMetrics {
  public tokenExchangeDurationHistogram = new Histogram({
    name: "oasis_token_exchange_duration_seconds",
    help: "Duration of token exchange in seconds",
    labelNames: ["provider"],
  });
  public tokenExchangeFailures = new Counter({
    name: "oasis_token_exchange_failures",
    help: "Number of failed token exchanges",
    labelNames: ["provider"],
  });
  public tokenExchanges = new Counter({
    name: "oasis_token_exchanges",
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

const prometheus = (global as AuthMetricsGlobal)[authMetricsSymbol];

export function withPrometheus(
  oboProvider: InternalOboProvider,
): InternalOboProvider {
  return async (provider: IdentityProvider, token, audience) => {
    const measureTokenExchange = prometheus.tokenExchangeDurationHistogram
      .labels({ provider })
      .startTimer();

    const oboToken = await oboProvider(provider, token, audience);

    measureTokenExchange();

    if (!oboToken.ok) {
      prometheus.tokenExchangeFailures.labels({ provider }).inc();
    }

    prometheus.tokenExchanges.labels({ provider }).inc();
    return oboToken;
  };
}
