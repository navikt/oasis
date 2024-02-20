# @navikt/oasis

![OBO](/img/obo.jpg)

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
