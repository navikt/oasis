import { createGetToken } from "../client";
import env from "env-var";
import { JWK } from "jose/dist/types/types";
import { memoize } from "lodash";

const options = memoize(() => ({
  clientId: env.get("AZURE_APP_CLIENT_ID").required().asString(),
  privateJWK: env.get("AZURE_APP_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env
    .get("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT")
    .required()
    .asUrlString(),
  issuer: env.get("AZURE_OPENID_CONFIG_ISSUER").required().asString(),
}));

const getToken = createGetToken(options);
const azureAd = { getToken };

export default azureAd;
export { getToken };
