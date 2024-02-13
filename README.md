# @navikt/oasis

Opinionated bibliotek for å verifisere tokens fra [Wonderwall](https://doc.nais.io/addons/wonderwall/) på NAIS-plattformen.

> [!NOTE]
> Ja, navnet er inspirert av at biblioteket brukes sammen med Wonderwall og bedriver OAuth-greier.

Kommer med støtte for både [Idporten](https://doc.nais.io/security/auth/idporten/) og [AzureAD](https://doc.nais.io/security/auth/azure-ad/) som OIDC-providers, og henter automatisk ut konfigurasjon fra miljøet.

Støtter On-Behalf-Of(OBO) utveksling mot både [TokenX](https://doc.nais.io/security/auth/tokenx/) (for Idporten) og Azure.

Støtter alle rammeverk hvor `request`-objekt utledes
fra NodeJS sin [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage).

## Installasjon i prosjektet ditt

```bash
npm install @navikt/oasis
```

> [!NOTE]
> @navikt-scopede pakker hentes fra GitHubs NPM-register, tilgang dit må [konfigureres](https://github.com/navikt/frontend#github-npm-registry).

## Quick start

```javascript
import { getSession } from "@navikt/oasis";

const session = await getSession(req);
const onBehalfOfToken = await session.apiToken(audience);
// call a service using this token
```

... hvor `req` er en `IncomingMessage | Request`, og audience er applikasjonen du skal kalle på formen `cluster:namespace:app`, feks `dev-gcp:mitteam:minapp`.

For at dette skal virke må du ha konfigurert bruk av [AzureAd](https://doc.nais.io/security/auth/azure-ad/) eller [ID-porten](https://doc.nais.io/security/auth/idporten/) i nais-manifestet ditt.

`getSession` validerer tokenet i requestens authorization-header.

`session.apiToken` cacher tokens i minne, og samler metrikker med Prometheus.

Om du ikke har noen spesielle behov er dette alt du trenger å gjøre for å validere og utveksle tokens i appen din.

## Tilpasninger man kan gjøre

Hvis du ønsker å ha mere kontroll på konfigurasjonen selv

Lag en fil et sted, `lib/getSession.js` og kall `makeSession()` med den identity og OBO provider du vil ha.

```javascript
import { makeSession } from "@navikt/oasis";
import { idporten } from "@navikt/oasis/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/oasis/obo-providers";

export const getSession = makeSession({
  identityProvider: idporten,
  oboProvider: tokenX,
});
```

### Caching av OBO tokens

For å cache OBO-tokens kan du wrappe provideren med `withInMemoryCache()` slik:

```javascript
export const getSession = makeSession({
  identityProvider: idporten,
  oboProvider: withInMemoryCache(tokenX),
});
```

For å måle cache hitrate kan du sende med `cacheHit` og `cacheMiss`.

```javascript
export const getSession = makeSession({
  identityProvider: idporten,
  oboProvider: withInMemoryCache(tokenX, {
    cacheHit: (key) => metrics.add("cache-hit"),
    cacheMiss: (key) => metrics.add("cache-miss"),
  }),
});
```

> [!NOTE]
> Cachen er i det lokale minnet, så dersom du kjører flere instanser av appen din (a.k.a. flere pods) så vil du kun få treff i cachen de gangene etterfølgende requests treffer på samme pod.

### Måling av tid brukt

Vil du måle hvor mye tid noe tar kan du lage en egen wrapper. Du kan velge selv om du vil måle med eller uten cache
hits, eller begge deler, avhengig av hvor du plasserer `withMetrics()`.

```javascript
function withMetrics(oboProvider: OboProvider): OboProvider {
  return async (token, audience) => {
    const stopMeasure = jest.fn();
    const oboToken = (await oboProvider(token, audience)) + "-instrumented";
    stopMeasure();
    return oboToken;
  };
}

export const getSession = makeSession({
  identityProvider: idporten,
  oboProvider: withInMemoryCache(withMetrics(tokenX), {
    cacheHit: (key) => metrics.add("cache-hit"),
    cacheMiss: (key) => metrics.add("cache-miss")
  }),
});

```
