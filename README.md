# @navikt/oasis

![OBO](/img/obo.jpg)

Bibliotek for å validere tokens fra Wonderwall og utføre On-Behalf-Of (OBO) Exchange mot både Azure og IDporten 

### Bruk

```ts
const token = req.headers.authorization.replace("Bearer ", "");

const validation = await validateToken(token);

if (validation.ok) {
  const obo = await requestOboToken(token, audience);

  if (obo.ok) {
    // make api request with obo.token
  } else {
    // handle error
  }
} else {
  // handle error
}
```

### Spørsmål?

Eller kommentarer? Lag en issue eller kontakt oss på [#oasis-maintainers(https://nav-it.slack.com/archives/C06GZFG0ELC) på Slack.

