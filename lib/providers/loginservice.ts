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
    if (!process.env.LOGINSERVICE_WELL_KNOWN_URL) {
      console.warn(
        `Miljøvariabelen "LOGINSERVICE_WELL_KNOWN_URL" bør være satt. Du finner mulige verdier her: https://security.labs.nais.io/pages/legacy/loginservice/idprovider.html`
      );
    }
    _issuer = await Issuer.discover(
      process.env.LOGINSERVICE_WELL_KNOWN_URL || defaultLoginserviceWellKnownURL
    );
  }
  return _issuer;
}

const defaultLoginserviceWellKnownURL =
  "https://navnob2c.b2clogin.com/navnob2c.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_idporten";

export default {
  validerToken,
};

export { validerToken };
