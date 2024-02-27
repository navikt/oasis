# @navikt/oasis

Bibliotek for å validere tokens fra [Wonderwall](https://doc.nais.io/security/auth/wonderwall) og utføre On-Behalf-Of (OBO) Exchange mot både ~Azure~ [Entra](https://doc.nais.io/security/auth/azure-ad/) og [TokenX](https://doc.nais.io/security/auth/tokenx/).

![OBO](/img/obo.jpg)

## Installasjon

```bash
npm install @navikt/oasis
```

> [!NOTE]
> @navikt-scopede pakker hentes fra GitHubs NPM-register Tilgang dit må [konfigureres](https://github.com/navikt/frontend#github-npm-registry).

## Quick start

```ts
const token = getToken(req);
if (!token) {
  /* håndter manglende token */
}

const validation = await validateToken(token);
if (!validation.ok) {
  /* håndter valideringsfeil */
}

const obo = await requestOboToken(token, "an:example:audience");
if (!obo.ok) {
  /* håndter obofeil */
}

fetch("https://example.com/api", {
  headers: { Authorization: `Bearer ${obo.token}` },
});
```

## API

### validateToken(token)

Utfører validering av et token mot enten Azure eller Idporten, avhengig av verdien til noen miljøvariabler som settes av NAIS (IDPORTEN_ISSUER og AZURE_OPENID_CONFIG_ISSUER).

#### Parametre

`token: string`: Tokenet du får fra din konsument.

#### Returverdi

En `Promise` som resolver til et `ValidationResult`-objekt.

#### Azure, Idporten og TokenX

Om du har både azure og idporten enabled, eller av andre grunner ønsker å eksplisitt validere mot en gitt tjeneste eksponeres disse funksjonene direkte:

```ts
validateAzureToken(token);
validateIdportenToken(token);
validateTokenxToken(token);
```

---

### requestOboToken(token, audience)

Gjør on-behalf-of-utveksling mot enten Azure eller Idporten, avhengig av verdien til noen miljøvariabler som settes av NAIS (IDPORTEN_ISSUER og AZURE_OPENID_CONFIG_ISSUER). Før du utfører OBO-utveksling må tokenet være validert.

OBO-tokens caches i applikasjonens minne inntil det utløper.

Prometheus-metrikker for OBO-utveksling er tilgjengelig gjennom biblioteket `"prom-client"`. Eksempelappen viser hvordan disse kan eksponeres med [config i nais.yaml](.nais/nais-idporten.yaml) og [endepunkt](example-app/pages/api/internal/metrics.ts). [Vi har et dashboard i Grafana hvor du kan utforske dine Prometheus-data](https://grafana.nav.cloud.nais.io/d/A-QjTBGSz/dagpenger-auth-token-exchange).

#### Parametre

`token: string`: Tokenet du får fra din konsument.

`audience: string`: Client ID til APIet du skal kontakte på formatet `"cluster:namespace:app"`.

#### Returverdi

En `Promise` som resolver til et `OboResult`-objekt.

> [!WARNING]  
> Pass på at du ikke bruker et `OboResult`-objekt direkte i f.eks. en tempalte string. Det er token-feltet som har selve tokenet.

❌ FEIL:

```ts
const obo = await requestOboToken(token, "an:example:audience");
if (obo.ok) {
  const headers = { Authorization: `Bearer ${obo}` };
}
```

✅ RIKTIG:

```ts
const obo = await requestOboToken(token, "an:example:audience");
if (obo.ok) {
  const headers = { Authorization: `Bearer ${obo.token}` };
}
```

#### Azure og TokenX

Om du har både azure og idporten enabled, eller av andre grunner ønsker å eksplisitt validere mot en gitt tjeneste eksponeres disse funksjonene direkte:

```ts
requestAzureOboToken(token, audience);
requestTokenxOboToken(token, audience);
```

---

### getToken(val)

#### Parametre

`val: Request | IncomingMessage | Headers | string`

#### Returverdi

En `string` token eller `null` om argumentet ikke inneholder noe token.

---

### expiresIn(token)

#### Parametre

`token: string`: Et token med exp-payload.

#### Returverdi

Et `number` med antall sekunder til tokenet uløper.

Funksjonen kaster feil om dekoding av tokenet feiler, eller om tokenet ikke har en `exp`-payload.

---

### Spørsmål?

Eller kommentarer? Lag en issue eller kontakt oss på [#oasis-maintainers](https://nav-it.slack.com/archives/C06GZFG0ELC) på Slack.
