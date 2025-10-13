import { exportJWK, generateKeyPair, SignJWT } from "jose";

const alg = "RS256";

const cachedKeyPair = generateKeyPair(alg);
const privateKey = async () => (await cachedKeyPair).privateKey;

export const jwkPrivate = async () => exportJWK(await privateKey());

export const token = async ({
  audience = "default_audience",
  issuer = "default_issuer",
  algorithm = alg,
  exp = Math.round(Date.now() / 1000) + 1000,
  ...payload
}: {
  audience?: string;
  issuer?: string;
  algorithm?: string;
  exp?: number | string;
} & Record<string, unknown> = {}) =>
  new SignJWT(payload)
    .setExpirationTime(exp)
    .setProtectedHeader({ alg: algorithm })
    .setAudience([audience, "https://nav.no"])
    .setIssuer(issuer)
    .setJti(`${Math.random()}`)
    .sign(await privateKey());

export const tokenWithoutExp = async () =>
  new SignJWT().sign(await privateKey());
