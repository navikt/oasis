import {
  GenerateKeyPairResult,
  SignJWT,
  exportJWK,
  generateKeyPair,
} from "jose";

const alg = "RS256";

const cachedKeyPair = generateKeyPair(alg);
const privateKey = async () => (await cachedKeyPair).privateKey;

export const jwk = async () => exportJWK((await cachedKeyPair).publicKey);
export const jwkPrivate = async () => exportJWK(await privateKey());

export const token = async ({
  pid = "pid",
  audience = "default_audience",
  issuer = "default_issuer",
  algorithm = alg,
  exp = Math.round(Date.now() / 1000) + 1000,
}: {
  pid?: string;
  audience?: string;
  issuer?: string;
  algorithm?: string;
  exp?: number;
} = {}) =>
  new SignJWT({
    pid,
  })
    .setExpirationTime(exp)
    .setProtectedHeader({ alg: algorithm })
    .setAudience([audience, "https://nav.no"])
    .setIssuer(issuer)
    .setJti(`${Math.random()}`)
    .sign(await privateKey());
