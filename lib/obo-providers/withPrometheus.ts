import { OboProvider } from "../index";
import prometheus from "../metrics/prometheus";
import { register } from "prom-client";

export function withPrometheus(oboProvider: OboProvider): OboProvider {
  const provider = oboProvider.name;
  return async (token, audience) => {
    console.log("Doing exchcange");
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

    console.log("Successfull exchange. Metrics should have values now");
    console.log(
      await register.getSingleMetric("dp_auth_token_exchanges")!.get()
    );

    return oboToken;
  };
}
