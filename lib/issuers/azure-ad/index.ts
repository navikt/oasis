import { createGetToken } from "../client";
import env from "env-var";
import { JWK } from "jose/dist/types/types";
import { memoize } from "lodash";
import { TokenIssuer } from "../index";

const options = memoize(() => ({
  clientId: env.get("AZURE_APP_CLIENT_ID").required().asString(),
  privateJWK: env.get("AZURE_APP_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env
    .get("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT")
    .required()
    .asUrlString(),
  issuer: env.get("AZURE_OPENID_CONFIG_ISSUER").required().asString(),
}));

const exchangeToken = createGetToken(options);
const azureAd: TokenIssuer = { exchangeToken };

export default azureAd;
export { exchangeToken };
