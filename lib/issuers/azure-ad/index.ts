import TokenExchange, { ClientConfig } from "../client";
import env from "env-var";
import { JWK } from "jose/dist/types/types";
import { memoize } from "lodash";
import { TokenIssuer } from "../index";
import { Client, GrantBody, Issuer } from "openid-client";

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

  getClient(): Client {
    const issuer = new Issuer({
      issuer: this._config.issuer,
      token_endpoint: this._config.tokenEndpoint,
      token_endpoint_auth_signing_alg_values_supported: ["RS256"],
    });
    const jwk = this._config.privateJWK;
    return new issuer.Client(
      {
        client_id: this._config.clientId,
        client_secret: this._azureConfig.clientSecret,
        token_endpoint_auth_method: "client_secret_basic",
      },
      { keys: [jwk] }
    );
  }

  grantBody(audience: string, subject_token: string): GrantBody {
    return {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
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
