import { NextApiResponse } from "next";
import { Client, GrantBody, Issuer, TokenSet } from "openid-client";
import { AuthedNextApiRequest, env } from "./index";
import { TokenXConfig } from "../../auth-config";

let tokenXClient: Client;

export default async function tokenx(
  req: AuthedNextApiRequest,
  res: NextApiResponse,
  next
) {
  if (!tokenXClient) {
    tokenXClient = await getTokenXClient(req.options.tokenXConfig);
  }

  if (!req.user) return next();

  req.user.tokenFor = async (audience) => {
    const subject_token = req.user.tokenset.access_token;
    const now = Math.floor(Date.now() / 1000);
    const additionalClaims = {
      clientAssertionPayload: {
        nbf: now,
        aud: tokenXClient.issuer.metadata.token_endpoint,
      },
    };

    const grantBody: GrantBody = {
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      audience,
      subject_token,
    };

    return tokenXClient
      .grant(grantBody, additionalClaims)
      .then((tokenSet: TokenSet) => tokenSet.access_token)
      .catch((err) => {
        console.error(
          `Error while exchanging IDporten token with TokenX: ${err}. Response from TokenX:`,
          err.response.body
        );
        throw err;
      });
  };
  return next();
}

async function getTokenXClient(config: TokenXConfig): Promise<Client> {
  const jwk = config.privateJwk;

  const issuer = await Issuer.discover(config.wellKnownUrl);
  const client = new issuer.Client(
    {
      client_id: config.clientId,
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
    },
    { keys: jwk }
  );

  return client;
}
