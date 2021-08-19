# dp-auth

Autentiseringsmodul for NextJS appene til dagpengeteamet

## Testing

```bash
docker-compose up -d
npm run test # Funker ikke enda, må gjøres i browser på grunn av cookies
```

### Genering av ny private JWK

Bruk https://mkjwk.org/ og velg:

- Key Use: Signature
- Algorithm: RS256
- Key ID: Hva som helst, f.eks. SHA-256

Kopier `Public and Private Keypair` inn i `[...auth].ts`, gjerne unik for både ID-porten og TokenX.

`mock-oauth2-server` sjekker ikke om nøkkelen som er brukt for signering er en kjent nøkkel, og det trengs ingen
endringer der.