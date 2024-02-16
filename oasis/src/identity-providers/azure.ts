import { JWTVerifyResult, jwtVerify } from "jose";
import { IdentityProvider } from "..";
import { cachedRemoteJWKSet } from "../utils/cachedRemoteJWKSet";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";

const azureJWKSet = () =>
  cachedRemoteJWKSet(process.env.AZURE_OPENID_CONFIG_JWKS_URI!);

async function verify(token: string): Promise<JWTVerifyResult> {
  return jwtVerify(token, azureJWKSet(), {
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER,
    audience: process.env.AZURE_APP_CLIENT_ID,
  });
}

const azure: IdentityProvider = async (req) => {
  const token = getTokenFromHeader(req.headers);
  if (!token) return null;
  await verify(token);
  return token;
};

export default azure;
