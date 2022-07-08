import {
  createRemoteJWKSet,
  FlattenedJWSInput,
  JWSHeaderParameters,
  jwtVerify,
  JWTVerifyResult,
} from "jose";
import { AuthProvider } from "../server/middleware";
import { GetKeyFunction } from "jose/dist/types/types";
import { getToken, redirect } from "./wonderwall";
import azureAdIssuer from "../issuers/azure-ad";

let remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

function getJWKS() {
  if (!remoteJWKSet)
    remoteJWKSet = createRemoteJWKSet(
      new URL(process.env.AZURE_OPENID_CONFIG_JWKS_URI as string)
    );
  return remoteJWKSet;
}

function verifyToken(token: string | Uint8Array): Promise<JWTVerifyResult> {
  return jwtVerify(token, getJWKS(), {
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER,
    audience: process.env.AZURE_APP_CLIENT_ID,
  });
}

const exchangeToken = azureAdIssuer.getToken;

const azureAd: AuthProvider = {
  getToken,
  verifyToken,
  redirect,
  exchangeToken,
};

export default azureAd;
