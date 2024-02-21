# @navikt/oasis

![OBO](/img/obo.jpg)

Bibliotek for å validere tokens fra [Wonderwall](https://doc.nais.io/security/auth/wonderwall) og utføre On-Behalf-Of (OBO) Exchange mot både ~Azure~ [Entra](https://doc.nais.io/security/auth/azure-ad/) og [TokenX](https://doc.nais.io/security/auth/tokenx/).

### Ta i bruk biblioteket

Konfigurer bruk av [GitHub Package Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

```bash
npm install @navikt/oasis
```

```ts
import { validateToken } from "@navikt/oasis";
```

### Validere et token

```ts
const token = req.headers.authorization.replace("Bearer ", "");
const validation = await validateToken(token);
```

### Veksle et token

```ts
  const audience = 'dev-gcp:anotherteam:someapp'; // appen du vil kalle
  const obo = await requestOboToken(origToken, audience);

  if (obo.ok) {
    // make api request with obo.token as Bearer header
  } else {
    // handle error
  }
} else {
  // handle error
}
```

### Spørsmål?

Eller kommentarer? Lag en issue eller kontakt oss på [#oasis-maintainers](https://nav-it.slack.com/archives/C06GZFG0ELC) på Slack.

