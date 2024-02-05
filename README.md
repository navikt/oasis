# @navikt/oasis

Opinionated bibliotek for å verifisere tokens fra [Wonderwall](https://doc.nais.io/addons/wonderwall/) på NAIS-plattformen.

Kommer med støtte for både [Idporten](https://doc.nais.io/security/auth/idporten/) og [AzureAD](https://doc.nais.io/security/auth/azure-ad/) som OIDC-providers, og henter automatisk ut konfigurasjon fra miljøet.

Støtter On-Behalf-Of(OBO) utveksling mot både [TokenX](https://doc.nais.io/security/auth/tokenx/) (for Idporten) og Azure.

Støtter alle rammeverk hvor `request`-objekt utledes
fra NodeJS sin [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage).

## Quick start

Pakken må installeres
fra [GitHub NPM Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
.

```
npm i @navikt/oasis
```

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

## Caching av OBO tokens

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

## Måling av tid brukt

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
