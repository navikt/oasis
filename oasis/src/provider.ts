import azure from "./identity-providers/azure";
import idporten from "./identity-providers/idporten";
import {
  GetSessionWithOboProvider,
  SessionWithOboProvider,
  SupportedRequestType,
  makeSession,
} from "./index";
import { withInMemoryCache } from "./obo-providers";
import azureOBO from "./obo-providers/azure";
import tokenX from "./obo-providers/tokenx";
import { withPrometheus } from "./obo-providers/withPrometheus";

let session: GetSessionWithOboProvider;

export const getSession: (
  req: SupportedRequestType,
) => Promise<SessionWithOboProvider> = (req) => {
  if (!session) {
    if (process.env.AZURE_OPENID_CONFIG_ISSUER && process.env.IDPORTEN_ISSUER) {
      throw new Error(
        "Both AZURE_OPENID_CONFIG_ISSUER and IDPORTEN_ISSUER are present as env variables. If you need both, you have to configure token exchange manually.",
      );
    } else if (process.env.IDPORTEN_ISSUER) {
      session = makeSession({
        identityProvider: idporten,
        oboProvider: withInMemoryCache(withPrometheus(tokenX)),
      });
    } else if (process.env.AZURE_OPENID_CONFIG_ISSUER) {
      session = makeSession({
        identityProvider: azure,
        oboProvider: withInMemoryCache(withPrometheus(azureOBO)),
      });
    } else {
      throw new Error(
        "None of AZURE_OPENID_CONFIG_ISSUER and IDPORTEN_ISSUER are present as env variables. You need to set one of them in your nais.yaml.",
      );
    }
  }

  return session(req);
};
