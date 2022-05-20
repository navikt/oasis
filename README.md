# dp-auth

Autentiseringsmodul for NextJS appene til dagpengeteamet

## Quick start

Pakken må installeres fra [GitHubs npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

```
npm i dp-auth
```

Lag en fil i `pages/api/auth` som heter `[...auth].js`

```javascript
import DpAuthHandler from "@navikt/dp-auth";

export default DpAuthHandler;
```

## Konfigurasjon

Applikasjonen må eksponere henholdsvis miljøvariablene: 

- SELF_URL - som er en peker på applikasjonens ingress, som er hele url. feks https://arbeid.nav.no/arbeid/dagpenger/soknad
- NEXT_PUBLIC_BASE_PATH - som er applikasjonens egen "base path", feks arbeid/dagpenger/soknad



Pakken baserer seg på konvensjoner fra NAIS-plattformen og trenger i utgangspunktet ikke noe mere konfigurasjon

## URL til "Well-known / Discovery URL" for Loginservice
Ligger i ett config map som er er tilgjengelig i alle cluster. Dette configmappet må mountes in av alle apper som bruker denne pakken. 
For detaljer se [loginservice på github](https://github.com/navikt/loginservice#metadata)



Eksempel for produksjon:
```
LOGINSERVICE_URL - som er en url til loginservice i nav, feks https://loginservice.nav.no/login
```

Husk også at appens url må whitelistes av loginservice i nav https://github.com/navikt/loginservice#allowlist-of-redirect-urls

## Testing

```bash
npm run test 
```
