import env from "env-var";
import { JWK } from "jose/dist/types/types";
import TokenExchange from "../client";
import { memoize } from "lodash";
import { TokenIssuer } from "../index";

const options = () => ({
  clientId: env.get("TOKEN_X_CLIENT_ID").required().asString(),
  privateJWK: env.get("TOKEN_X_PRIVATE_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env.get("TOKEN_X_TOKEN_ENDPOINT").required().asUrlString(),
  issuer: env.get("TOKEN_X_ISSUER").required().asString(),
});

const exchangeToken = memoize(() => {
  const client = new TokenExchange(options());
  return client.getToken.bind(client);
});

const tokenx: TokenIssuer = { exchangeToken };

export default tokenx;
export { exchangeToken };
