# @navikt/oasis

```ts
validateToken(token).then((validationResult) =>
  validationResult.match({
    Ok: () => {
      requestOboToken(token, audience).then((oboResult) =>
        oboResult.match({
          Ok: (oboToken) => {
            // make api call
          },
          Error: (error) => {
            throw error;
          },
        }),
      );
    },
    Error: (error) => {
      throw error;
    },
  }),
);
```
