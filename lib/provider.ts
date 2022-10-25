import { GetSessionWithOboProvider, makeSession } from "./index";
import { getIdportenToken } from "./oidc/getIdportenToken";
import getTokenXOBO from "./obo/tokenx";
import { getAzureToken } from "./oidc/getAzureToken";
import getAzureOBO from "./obo/azure";

export let getSession: GetSessionWithOboProvider;
if (process.env.PROVIDER == "idporten") {
  getSession = makeSession({
    identityProvider: getIdportenToken,
    oboProvider: getTokenXOBO,
  });
} else if (process.env.PROVIDER == "azure") {
  getSession = makeSession({
    identityProvider: getAzureToken,
    oboProvider: getAzureOBO,
  });
}
