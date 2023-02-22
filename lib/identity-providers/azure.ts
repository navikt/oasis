import { IncomingMessage } from "http";
import { Token } from "../index";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";
import { jwtVerify, JWTVerifyResult } from "jose";
import { cachedRemoteJWKSet } from "../utils/cachedRemoteJWKSet";

const azureJWKSet = () =>
  cachedRemoteJWKSet(process.env.AZURE_OPENID_CONFIG_JWKS_URI as string);

async function verify(token: string): Promise<JWTVerifyResult> {
  const result = await jwtVerify(token, azureJWKSet(), {
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER,
  });
  return result;
}

export default async function azure(
  req: IncomingMessage | Request
): Promise<Token | null> {
  const token = getTokenFromHeader(req.headers);
  if (!token) return null;
  await verify(token);
  return token;
}
