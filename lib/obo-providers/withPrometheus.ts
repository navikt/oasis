import { OboProvider } from "../index";
import prometheus from "../metrics/prometheus";

export function withPrometheus(oboProvider: OboProvider): OboProvider {
  const provider = oboProvider.name;
  return async (token, audience) => {
    const measureTokenExchange = prometheus.tokenExchangeDurationHistogram
      .labels({ provider })
      .startTimer();

    prometheus.tokenExchanges.labels({ provider }).inc();
    const oboToken = await oboProvider(token, audience);
    measureTokenExchange();

    if (!oboToken) {
      prometheus.tokenExchangeFailures.labels({ provider }).inc();
      return oboToken;
    }

    return oboToken;
  };
}
