import { Client, Issuer } from "openid-client";
import {
  GetKeyFunction,
  JWSHeaderParameters,
  jwtVerify,
} from "jose/jwt/verify";
import { createRemoteJWKSet } from "jose/jwks/remote";
import { FlattenedJWSInput } from "jose/types";

let _issuer: Issuer<Client>;
let _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

async function validerToken(token: string | Uint8Array) {
  return jwtVerify(token, await jwks(), {
    issuer: (await issuer()).metadata.issuer,
  });
}

async function jwks() {
  if (typeof _remoteJWKSet === "undefined") {
    const iss = await issuer();
    _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri));
  }

  return _remoteJWKSet;
}

async function issuer() {
  if (typeof _issuer === "undefined") {
    if (!process.env.IDPORTEN_WELL_KNOWN_URL)
      throw new Error(`Miljøvariabelen "IDPORTEN_WELL_KNOWN_URL" må være satt`);
    _issuer = await Issuer.discover(process.env.IDPORTEN_WELL_KNOWN_URL);
  }
  return _issuer;
}

export default {
  validerToken,
};

export { validerToken };
