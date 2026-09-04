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
  /* håndter obo-feil */
}

fetch("https://example.com/api", {
  headers: { Authorization: `Bearer ${obo.token}` },
});

const parse = parseAzureUserToken(token);
if (parse.ok) {
  console.log(`Bruker: ${parse.preferred_username} (${parse.NAVident})`);
}
```

## API

### validateToken(token)

Utfører validering av et token mot enten Azure eller Idporten, avhengig av verdien til noen miljøvariabler som settes av NAIS (IDPORTEN_ISSUER og AZURE_OPENID_CONFIG_ISSUER).

#### Parametre

`token: string`: Tokenet du får fra din konsument.

#### Returverdi

En `Promise` som resolver til et `ValidationResult`-objekt med `JWTPayload`.

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

Prometheus-metrikker for OBO-utveksling er tilgjengelig gjennom biblioteket `"@prometheus-io/client"`. Eksempelappen viser hvordan disse kan eksponeres med [config i nais.yaml](.nais/nais-idporten.yaml) og [endepunkt](example-app/pages/api/internal/metrics.ts). [Vi har et dashboard i Grafana hvor du kan utforske dine Prometheus-data](https://grafana.nav.cloud.nais.io/d/A-QjTBGSz/dagpenger-auth-token-exchange).

#### Parametre

`token: string`: Tokenet du får fra din konsument.

`audience: string`: Client ID til APIet du skal kontakte på formatet `"cluster:namespace:app"` for TokenX eller `"api://cluster.namespace.app/.default" for Azure` (gitt at man skal ha default permissions).

#### Returverdi

En `Promise` som resolver til et `TokenResult`-objekt med OBO-token.

> [!WARNING]  
> Pass på at du ikke bruker et `TokenResult`-objekt direkte i f.eks. en tempalte string. Det er token-feltet som har selve tokenet.

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

### requestAzureClientCredentialsToken(scope)

Oasis kan også brukes til å bytte tokens utenom en bruker-kontekst. Dette er et såkalt ["maskin til maskin"-token-bytte](https://docs.nais.io/auth/entra-id/how-to/consume-m2m/)
som bruker `client_credentials`-flyt.

```ts
const clientCredentials = await requestAzureClientCredentialsToken(
  "api://<cluster>.<namespace>.<other-api-app-name>/.default",
);

if (clientCredentials.ok) {
  const headers = { Authorization: `Bearer ${clientCredentials.token}` };
}
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

--

### parseIdportenToken(token)

#### Parametre

`token: string`: Et validert idportentoken.

#### Returverdi

Et `ParseResult` med `IdportenPayload`-verdier eller ok=false.

### parseAzureUserToken(token)

#### Parametre

`token: string`: Et validert idportentoken.

#### Returverdi

Et `ParseResult` med `AzurePayload`-verdier.

### parseIdportenToken(token)

#### Parametre

`token: string`: Et validert idportentoken.

#### Returverdi

Et `ParseResult` med `IdportenPayload`-verdier.

---

## Bidra

Bidrag er velkomne — både issues, forslag og pull requests.

### Kom i gang

Repoet er et Yarn-workspace med to biblioteker (`libs/texas`, `libs/oasis`) og en eksempelapp (`example-app`).

```bash
git clone https://github.com/navikt/oasis.git
cd oasis
corepack enable
yarn install
```

Node 24 kreves. Bruker du [mise](https://mise.jdx.dev/), gir `mise install` riktig versjon.

### Nyttige kommandoer

| Kommando            | Gjør |
|---------------------| --- |
| `yarn test`         | Kjører tester i alle pakker |
| `yarn lint`         | Sjekker formatering og lint med Biome |
| `yarn lint --write` | Retter det som kan rettes automatisk |
| `yarn build:lib`    | Bygger begge bibliotekene |
| `yarn tsc`          | Kjører TypeScript uten å bygge |

`libs/oasis` avhenger av `libs/texas`, så kjør `yarn build:lib` (eller `yarn workspace @navikt/texas build`) før du kjører tester lokalt første gang.

### Sende en pull request

1. Lag en gren fra `main`.
2. Skriv tester for endringen. Auth-logikk bør ha tester for både gyldige og ugyldige tokens.
3. Kjør `yarn lint` og `yarn test` lokalt.
4. Opprett en PR mot `main`. Tester, lint, build og sikkerhetsskann kjører automatisk.
5. Endringen må godkjennes av [@navikt/oasis-maintainers](https://github.com/orgs/navikt/teams/oasis-maintainers).

Endrer du noe under `.github/workflows/`, kjør `uvx zizmor@1.30.0 .` lokalt. Skannen må være grønn, og nye actions skal SHA-pinnes.

#### PR-tittelen blir til release notes

PR-er squash-merges, og tittelen havner ordrett i release notes. Beskriv hva endringen gjør:

| I stedet for | Skriv |
| --- | --- |
| `fix stuff` | `Rett feilhåndtering når Texas svarer 503` |
| `oppdater oasis` | `Støtt flere audiences i requestOboToken` |
| `wip` | `Fjern deprecated prom-client til fordel for @prometheus-io/client` |

Du trenger ikke merke PR-en. Dependabot havner under «Avhengigheter», alt annet under «Endringer».

### Teste mot en ekte applikasjon

Hver merge til `main` publiserer en betaversjon, så du kan teste endringen i din egen app før den slippes:

```bash
npm install @navikt/oasis@beta
```

`example-app` deployes samtidig til dev-gcp: [Azure AD](https://oasis-azure.intern.dev.nav.no) og [ID-porten](https://oasis-idporten.intern.dev.nav.no).

### Release

Krever maintainer-tilgang. To måter å starte samme workflow:

- **UI:** Actions → Release → Run workflow, med `main` valgt. Velg `patch`, `minor` eller `major`.
- **CLI**, hvis du vil sette versjonen selv: `git tag v5.0.0 && git push origin v5.0.0`

Workflowen kjører lint, test og build, publiserer begge pakkene til GitHub Packages, og lager en GitHub Release med release notes generert fra PR-titlene.

`version` i `libs/*/package.json` holdes ikke i sync med taggen automatisk — bump den manuelt i en egen PR.

Fant du et sikkerhetsproblem i biblioteket? Meld fra på Slack framfor å opprette en offentlig issue.

---

## Spørsmål?

Eller kommentarer? Lag en issue eller kontakt oss på [#oasis-maintainers](https://nav-it.slack.com/archives/C06GZFG0ELC) på Slack.
