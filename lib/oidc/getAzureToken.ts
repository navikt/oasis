import { IncomingMessage } from "http";
import { Token } from "../index";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";
import _ from "lodash";
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from "jose";

const cachedRemoteJWKSet = _.memoize(createRemoteJWKSet);

// TODO: Unngå at dette skjer on startup
const remoteJWKSet = cachedRemoteJWKSet(
  new URL(process.env.AZURE_OPENID_CONFIG_JWKS_URI as string)
);

async function verify(token: string): Promise<JWTVerifyResult> {
  const result = await jwtVerify(token, remoteJWKSet, {
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER,
  });
  return result;
}

export async function getAzureToken(
  req: IncomingMessage
): Promise<Token | null> {
  const token = getTokenFromHeader(req.headers);
  if (!token) return null;
  await verify(token);
  return token;
}
