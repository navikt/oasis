import azure from "./identity-providers/azure";
import idporten from "./identity-providers/idporten";
import { GetSession, GetSessionWithOboProvider, makeSession } from "./index";
import { withInMemoryCache } from "./obo-providers";
import azureOBO from "./obo-providers/azure";
import tokenX from "./obo-providers/tokenx";
import { withPrometheus } from "./obo-providers/withPrometheus";

let session: GetSessionWithOboProvider;

export const getSession: GetSession = (req) => {
  if (!session) {
    if (process.env.AZURE_OPENID_CONFIG_ISSUER && process.env.IDPORTEN_ISSUER) {
      throw new Error(
        "Both AZURE_OPENID_CONFIG_ISSUER and IDPORTEN_ISSUER are present as env variables. If you need both, you have to configure token exchange manually.",
      );
    } else if (process.env.AZURE_OPENID_CONFIG_ISSUER) {
      session = makeSession({
        identityProvider: idporten,
        oboProvider: withInMemoryCache(withPrometheus(tokenX)),
      });
    } else if (process.env.IDPORTEN_ISSUER) {
      session = makeSession({
        identityProvider: azure,
        oboProvider: withInMemoryCache(withPrometheus(azureOBO)),
      });
    }
  }

  return session(req);
};
