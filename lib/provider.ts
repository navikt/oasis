import { GetSession, makeSession } from "./index";
import { getIdportenToken } from "./oidc/getIdportenToken";
import getTokenXOBO from "./obo/tokenx";
import { getAzureToken } from "./oidc/getAzureToken";

export let getSession: GetSession;
if (process.env.PROVIDER == "idporten") {
  getSession = makeSession({
    identityProvider: getIdportenToken,
    oboProvider: getTokenXOBO,
  });
} else if (process.env.PROVIDER == "azure") {
  getSession = makeSession({
    identityProvider: getAzureToken,
    // oboProvider: getAzureOBO,
  });
}
