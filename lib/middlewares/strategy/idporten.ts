import { Client, Issuer, Strategy } from "openid-client";
import { User } from "../passport.mw";
import { IdPortenStrategyConfig } from "../../auth-config";

async function idporten(
  config: IdPortenStrategyConfig
): Promise<Strategy<User, Client>> {
  const issuer = await Issuer.discover(config.wellKnownUrl);

  const jwk = config.clientJwk;
  const client = new issuer.Client(
    {
      client_id: config.clientId,
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
      redirect_uris: [
        config.redirectUri || "http://localhost:3000/api/auth/callback",
      ],
      response_types: ["code"],
      scope: "openid profile",
      resource: "https://nav.no",
    },
    { keys: jwk }
  );
  return new Strategy(
    {
      client,
      params: {
        acr_values: "Level4",
        resource: "https://nav.no",
      },
      extras: {
        clientAssertionPayload: {
          aud: issuer.issuer,
        },
      },
    },
    (tokenset, userinfo, done) => {
      const { locale } = tokenset.claims();
      const user: User = {
        fnr: userinfo.pid,
        locale,
        tokenset,
      };
      // TODO: oauth2 mock server støtter ikke userinfo enda
      if (typeof userinfo === "function") return userinfo(null, user);
      return done(null, user);
    }
  );
}

export default idporten;
