import { GetSessionWithOboProvider, makeSession } from "./index";
import idporten from "./identity-providers/idporten";
import azure from "./identity-providers/azure";
import azureOBO from "./obo-providers/azure";
import tokenX from "./obo-providers/tokenx";
import { withPrometheus } from "./obo-providers/withPrometheus";

export let getSession: GetSessionWithOboProvider;
if (process.env.PROVIDER == "idporten") {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withPrometheus(tokenX),
  });
} else if (process.env.PROVIDER == "azure") {
  getSession = makeSession({
    identityProvider: azure,
    oboProvider: withPrometheus(azureOBO),
  });
}
