import env from "env-var";
import { JWK } from "jose/dist/types/types";
import { createGetToken } from "../client";
import { memoize } from "lodash";

const options = memoize(() => ({
  clientId: env.get("TOKEN_X_CLIENT_ID").required().asString(),
  privateJWK: env.get("TOKEN_X_PRIVATE_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env.get("TOKEN_X_TOKEN_ENDPOINT").required().asUrlString(),
  issuer: env.get("TOKEN_X_ISSUER").required().asString(),
}));

const getToken = createGetToken(options);
const tokenx = { getToken };

export default tokenx;
export { getToken };
