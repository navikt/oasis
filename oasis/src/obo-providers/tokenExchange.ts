import { Client, errors, GrantBody, GrantExtras } from "openid-client";
import OPError = errors.OPError;

export async function tokenExchange(
  client: Client,
  grantBody: GrantBody,
  additionalClaims: GrantExtras,
): Promise<string> {
  try {
    const tokenset = await client.grant(grantBody, additionalClaims);
    if (!tokenset.access_token) {
      throw Error("TokenSet does not contain an access_token");
    }
    return tokenset.access_token;
  } catch (e) {
    if (e instanceof OPError) console.warn(e.message, e.response?.body || "");
    throw e;
  }
}
