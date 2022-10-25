import { GetSessionWithOboProvider, makeSession } from "./index";
import { idporten } from "./oidc/idporten";
import { azure } from "./oidc/azure";
import azureOBO from "./obo/azure";
import tokenX from "./obo/tokenx";

export let getSession: GetSessionWithOboProvider;
if (process.env.PROVIDER == "idporten") {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: tokenX,
  });
} else if (process.env.PROVIDER == "azure") {
  getSession = makeSession({
    identityProvider: azure,
    oboProvider: azureOBO,
  });
}
