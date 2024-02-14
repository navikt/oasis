import { JWTVerifyResult, errors, jwtVerify } from "jose";
import { SupportedRequestType, Token } from "../index";
import { cachedRemoteJWKSet } from "../utils/cachedRemoteJWKSet";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";

const idportenJWKSet = () =>
  cachedRemoteJWKSet(process.env.IDPORTEN_JWKS_URI as string);

async function verify(token: string): Promise<JWTVerifyResult> {
  const result = await jwtVerify(token, idportenJWKSet(), {
    issuer: process.env.IDPORTEN_ISSUER,
    audience: process.env.IDPORTEN_AUDIENCE,
  });

  const acr = process.env.IDPORTEN_REQUIRED_ACR
    ? [process.env.IDPORTEN_REQUIRED_ACR]
    : ["Level4", "idporten-loa-high"];
  // @ts-expect-error acr
  if (result.payload["acr"] in acr) {
    throw new errors.JWTClaimValidationFailed(
      `unexpected "acr" claim value, expected "${acr}", recieved"${result.payload["acr"]}"`,
      "acr",
      "check_failed"
    );
  }
  return result;
}

export default async function idporten(
  req: SupportedRequestType
): Promise<Token | null> {
  const token = getTokenFromHeader(req.headers);
  if (!token) return null;
  await verify(token);
  return token;
}
