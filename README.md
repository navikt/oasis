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

Pakken baserer seg på konvensjoner fra NAIS-plattformen og trenger i utgangspunktet ikke noe configurasjon

[URL til "Well-known / Discovery URL" for Loginservice](https://security.labs.nais.io/pages/legacy/loginservice/idprovider.html) settes ikke av NAIS. Det ligger en default-verdi for produksjon i koden, men det anbefales at du legger til en verdi selv.

Variabelen må hete `LOGINSERVICE_WELL_KNOWN_URL`.

Eksempel for produksjon:
```
LOGINSERVICE_WELL_KNOWN_URL=https://navnob2c.b2clogin.com/navnob2c.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_idporten
```

## Testing

```bash
npm run test 
```