import { SignJWT, exportJWK, importJWK } from "jose";

const privateKey = () => importJWK(JSON.parse(process.env.PRIVATE_KEY!));
export const jwk = async () =>
  exportJWK(await importJWK(JSON.parse(process.env.PUBLIC_KEY!)));
export const jwkPrivate = async () => exportJWK(await privateKey());

export const token = async (
  pid: string,
  options: {
    issuer?: string;
    expirationTime?: string;
  } = {},
) =>
  new SignJWT({
    pid,
  })
    .setAudience(process.env.IDPORTEN_AUDIENCE!)
    .setSubject(Math.random().toString())
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer(options.issuer ?? "urn:example:issuer")
    .setExpirationTime(options.expirationTime ?? "2h")
    .sign(await privateKey());
