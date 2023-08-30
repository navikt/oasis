import { SupportedRequestType, Token } from "../index";
import { getTokenFromHeader } from "../utils/getTokenFromHeader";
import { errors, jwtVerify, JWTVerifyResult } from "jose";
import { cachedRemoteJWKSet } from "../utils/cachedRemoteJWKSet";

const idportenJWKSet = () =>
  cachedRemoteJWKSet(process.env.IDPORTEN_JWKS_URI as string);

async function verify(token: string): Promise<JWTVerifyResult> {
  const result = await jwtVerify(token, idportenJWKSet(), {
    issuer: process.env.IDPORTEN_ISSUER,
  });
  if (
    !("client_id" in result.payload) ||
    result.payload["client_id"] != process.env.IDPORTEN_CLIENT_ID
  ) {
    throw new errors.JWTClaimValidationFailed(
      `unexpected "client_id" claim value`,
      "client_id",
      "check_failed"
    );
  }
  const acr = process.env.IDPORTEN_REQUIRED_ACR ? [ process.env.IDPORTEN_REQUIRED_ACR ] : [ "Level4", "idporten-loa-high" ];
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
