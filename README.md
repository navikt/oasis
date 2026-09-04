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

| Kommando | Gjør |
| --- | --- |
| `yarn test` | Kjører tester i alle pakker |
| `yarn lint` | Sjekker formatering og lint med Biome |
| `yarn lint --write` | Retter det som kan rettes automatisk |
| `yarn build:lib` | Bygger begge bibliotekene |
| `yarn type-check` | Kjører TypeScript uten å bygge |

`libs/oasis` avhenger av `libs/texas`, så kjør `yarn build:lib` (eller `yarn workspace @navikt/texas build`) før du kjører tester lokalt første gang.

### Sende en pull request

1. Lag en gren fra `main`.
2. Skriv tester for endringen. Auth-logikk bør ha tester for både gyldige og ugyldige tokens.
3. Kjør `yarn lint` og `yarn test` lokalt. En pre-commit-hook kjører `type-check` og lint-staged automatisk.
4. Opprett en PR mot `main`. Da kjører tester, lint, build og en zizmor-sikkerhetsskann.
5. Endringen må godkjennes av [@navikt/oasis-maintainers](https://github.com/orgs/navikt/teams/oasis-maintainers).

Endrer du workflows, kjør `uvx zizmor@1.30.0 .` lokalt — skannen må være grønn før merge.

#### PR-tittelen blir til release notes

PR-er squash-merges, og tittelen havner ordrett i release notes for neste versjon. Den leses av team i hele Nav som skal vurdere om de bør oppgradere — så skriv den for dem, ikke for deg selv.

Beskriv hva endringen gjør, sett fra utsiden:

| I stedet for | Skriv |
| --- | --- |
| `fix stuff` | `Rett feilhåndtering når Texas svarer 503` |
| `oppdater oasis` | `Støtt flere audiences i requestOboToken` |
| `wip` | `Fjern deprecated prom-client til fordel for @prometheus-io/client` |

Du trenger ikke merke PR-en med noe. Dependabot-PR-er havner automatisk under «Avhengigheter», alt annet under «Endringer».

### Teste mot en ekte applikasjon

`example-app` deployes til dev-gcp ved hver merge til `main`, i to varianter (Azure AD og ID-porten). Den fungerer som en integrasjonstest mot ekte Nav-auth:

- https://oasis-azure.intern.dev.nav.no
- https://oasis-idporten.intern.dev.nav.no

Hver merge til `main` publiserer også en betaversjon av begge pakkene med `beta`-taggen, slik at du kan teste en endring i din egen applikasjon før den slippes:

```bash
npm install @navikt/oasis@beta
```

### Release

Krever maintainer-tilgang.

1. Gå til **Actions → Release → Run workflow**.
2. Velg `patch`, `minor` eller `major`. Neste versjon utledes fra siste tagg.
3. Workflowen kjører lint, test og build, publiserer `@navikt/texas` og `@navikt/oasis` til GitHub Packages, committer versjonsbumpen til `main` (`chore(release): vX.Y.Z`), og lager taggen `vX.Y.Z` med tilhørende GitHub Release og release notes.

Versjonsnummeret utledes fra siste tagg, og `package.json` i begge pakkene holdes synkronisert med den publiserte versjonen. Taggen lages først etter vellykket publisering, så en feilet build etterlater verken tagg eller versjonscommit.

Release notes genereres automatisk fra PR-titler siden forrige tagg, gruppert etter `.github/release.yaml`. Se [PR-tittelen blir til release notes](#pr-tittelen-blir-til-release-notes).

Trenger du en versjon som ikke følger patch/minor/major — for eksempel et hopp eller en prerelease — pusher du taggen manuelt. Da kjører den samme flyten:

```bash
git tag v5.0.0 && git push origin v5.0.0
```

### Sikkerhet i workflows

Workflowene skannes med [zizmor](https://docs.zizmor.sh/). `zizmor-scan-pr.yaml` kjører på hver PR og feiler ved nye funn, mens `zizmor-schedule.yaml` kjører ukentlig og laster opp resultater til Security-fanen. Unntak konfigureres i `.github/zizmor.yaml`, med begrunnelse for hvert unntak. Kjør skannen lokalt med `uvx zizmor@1.30.0 .` — samme versjon som i CI.

Alle actions er SHA-pinnet, og alle jobber starter med [harden-runner](https://github.com/step-security/harden-runner) i `audit`-modus, som logger utgående nettverkstrafikk uten å blokkere den. Når trafikkmønsteret er kjent fra jobbloggen, kan enkeltjobber strammes til `egress-policy: block` med en eksplisitt `allowed-endpoints`-liste. Begynn med `publish`-jobben i `release.yaml`, der en kompromittert avhengighet har størst konsekvens.

Jobber som publiserer pakker (`release.yaml` og `release-beta.yaml`) kjører uten avhengighetscache. En forgiftet cache kan ellers injisere kode i artefakten som publiseres. PR- og deploy-jobber beholder cachen, der gevinsten er reell og risikoen lav.

Fant du et sikkerhetsproblem i selve biblioteket? Meld fra på Slack framfor å opprette en offentlig issue.

---

## Spørsmål?

Eller kommentarer? Lag en issue eller kontakt oss på [#oasis-maintainers](https://nav-it.slack.com/archives/C06GZFG0ELC) på Slack.
