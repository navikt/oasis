import idporten from "@navikt/dp-auth/identity-providers/idporten";
import { makeSession } from "@navikt/dp-auth";
import azure from "@navikt/dp-auth/identity-providers/azure";
import azureOBO from "@navikt/dp-auth/obo-providers/azure";
import tokenX from "../lib/obo-providers/tokenx/index";

test("fo", () => {
  expect(idporten).not.toBeNull();
  expect(tokenX).not.toBeNull();
  expect(azure).not.toBeNull();
  expect(azureOBO).not.toBeNull();
  expect(makeSession).not.toBeNull();
});
