import {
  exportJWK,
  generateKeyPair,
  GenerateKeyPairResult,
  SignJWT,
} from "jose";
import { JWK } from "jose/dist/types/types";
import getConfig from "next/config";

const alg = "RS256";

export type tokenOptions = {
  expirationTime?: string | number;
  issuer?: string;
};

export async function token(
  pid: string,
  options?: tokenOptions
): Promise<string> {
  const { issuer, expirationTime } = {
    expirationTime: "2h",
    issuer: "urn:example:issuer",
    ...options,
  };
  const { privateKey } = await cachedKeyPair;
  const payload = {
    pid,
    acr: "Level4",
    client_id: process.env.IDPORTEN_CLIENT_ID,
  };
  return new SignJWT(payload)
    .setSubject(Math.random().toString(36).slice(2, 7))
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(<string>issuer)
    .setExpirationTime(<string | number>expirationTime)
    .sign(privateKey);
}

export async function jwk(): Promise<JWK> {
  const { publicKey } = await cachedKeyPair;
  return exportJWK(publicKey);
}

export async function jwkPrivate(): Promise<JWK> {
  const { privateKey } = await cachedKeyPair;
  return exportJWK(privateKey);
}

let cachedKeyPair: Promise<GenerateKeyPairResult>;

if (process.env.GENERATE_DEV_JWK == "enabled") {
  const { serverRuntimeConfig } = getConfig();
  cachedKeyPair = serverRuntimeConfig.key;
} else {
  console.log("IKKE LOL ");
  cachedKeyPair = generateKeyPair(alg);
}

export default cachedKeyPair;
