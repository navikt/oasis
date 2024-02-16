import { JWTVerifyResult, jwtVerify } from "jose";
import { IdentityProvider } from "../index";
import { cachedRemoteJWKSet } from "../utils/cachedRemoteJWKSet";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";

const idportenJWKSet = () =>
  cachedRemoteJWKSet(process.env.IDPORTEN_JWKS_URI as string);

async function verify(token: string): Promise<JWTVerifyResult> {
  return jwtVerify(token, idportenJWKSet(), {
    issuer: process.env.IDPORTEN_ISSUER,
    audience: process.env.IDPORTEN_AUDIENCE,
  });
}

const idporten: IdentityProvider = async (req) => {
  const token = getTokenFromHeader(req.headers);
  if (!token) return null;
  await verify(token);
  return token;
};

export default idporten;
