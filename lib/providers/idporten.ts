import {
  createRemoteJWKSet,
  errors,
  FlattenedJWSInput,
  JWSHeaderParameters,
  jwtVerify,
  JWTVerifyResult,
} from "jose";
import { AuthProvider } from "../server/middleware";
import { GetKeyFunction } from "jose/dist/types/types";
import { getToken, redirect } from "./wonderwall";
import tokenx from "../issuers/tokenx";

let remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

function getJWKS() {
  if (!remoteJWKSet)
    remoteJWKSet = createRemoteJWKSet(
      new URL(process.env.IDPORTEN_JWKS_URI as string)
    );
  return remoteJWKSet;
}

async function verifyToken(
  token: string | Uint8Array
): Promise<JWTVerifyResult> {
  const verifyResult = await jwtVerify(token, getJWKS(), {
    issuer: process.env.IDPORTEN_ISSUER,
  });
  if (verifyResult.payload["client_id"] != process.env.IDPORTEN_CLIENT_ID)
    throw new errors.JWTClaimValidationFailed(
      `unexpected "client_id" claim value`
    );

  return verifyResult;
}

const exchangeToken = tokenx.getToken;

const idporten: AuthProvider = {
  getToken,
  verifyToken,
  redirect,
  exchangeToken,
};

export default idporten;
