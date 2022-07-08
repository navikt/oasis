import TokenExchange, { ClientConfig } from "../client";
import env from "env-var";
import { JWK } from "jose/dist/types/types";
import { memoize } from "lodash";
import { TokenIssuer } from "../index";
import { GrantBody } from "openid-client";

const options = () => ({
  clientId: env.get("AZURE_APP_CLIENT_ID").required().asString(),
  clientSecret: env.get("AZURE_APP_CLIENT_SECRET").required().asString(),
  privateJWK: env.get("AZURE_APP_JWK").required().asJsonObject() as JWK,
  tokenEndpoint: env
    .get("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT")
    .required()
    .asUrlString(),
  issuer: env.get("AZURE_OPENID_CONFIG_ISSUER").required().asString(),
});

interface AzureClientConfig extends ClientConfig {
  clientSecret: string;
}

class AzureTokenExchange extends TokenExchange {
  private _azureConfig: AzureClientConfig;

  constructor(config: AzureClientConfig) {
    super(config);
    this._azureConfig = config;
  }

  grantBody(audience: string, subject_token: string): GrantBody {
    return {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: this._config.clientId,
      client_secret: this._azureConfig.clientSecret,
      assertion: subject_token,
      scope: audience,
      requested_token_use: "on_behalf_of",
    };
  }
}

const exchangeToken = memoize(() => {
  const client = new AzureTokenExchange(options());
  return client.getToken.bind(client);
});

const azureAd: TokenIssuer = { exchangeToken };

export default azureAd;
export { exchangeToken };
