import {
  exportJWK,
  generateKeyPair,
  GenerateKeyPairResult,
  SignJWT,
} from "jose";

const alg = "RS256";

const cachedKeyPair: Promise<GenerateKeyPairResult> = generateKeyPair(alg);
const privateKey = async () => (await cachedKeyPair).privateKey;

export const jwk = async () => exportJWK((await cachedKeyPair).publicKey);
export const jwkPrivate = async () => exportJWK(await privateKey());

export const token = async (
  pid: string,
  options: {
    issuer?: string;
    expirationTime?: string;
    audience?: string | string[];
  } = {}
) =>
  new SignJWT({
    pid,
  })
    .setSubject(Math.random().toString())
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setAudience(options.audience ?? "app-id")
    .setIssuer(options.issuer ?? "urn:example:issuer")
    .setExpirationTime(options.expirationTime ?? "2h")
    .sign(await privateKey());
