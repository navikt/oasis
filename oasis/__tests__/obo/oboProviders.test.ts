import { token } from "../__utils__/test-provider";
import { decodeJwt, OboProvider } from "../../src";
import tokenX from "../../src/obo-providers/tokenx";
import azureOBO from "../../src/obo-providers/azure";

describe.each([
  ["tokenX", tokenX, "urn:tokenx:dings"],
  ["azure", azureOBO, "urn:azure:dings"],
])("%s", (_, oboProvider: OboProvider, issuer: string) => {
  it("returns token when exchanges succeeds", async () => {
    const jwt = await oboProvider(await token("pid"), "audience");
    expect(jwt).not.toBeNull();

    const payload = decodeJwt(jwt!);
    expect(payload.iss).toBe(issuer);
  });
  it("returns null when exchange fails", async () => {
    const jwt = await oboProvider(await token("pid"), "error-audience");
    expect(jwt).toBeNull();
  });
});
