import { Client, errors, GrantBody, GrantExtras } from "openid-client";
import OPError = errors.OPError;

export async function getOBOToken(
  client: Client,
  grantBody: GrantBody,
  additionalClaims: GrantExtras
): Promise<string | null> {
  try {
    const tokenset = await client.grant(grantBody, additionalClaims);
    return tokenset.access_token ?? null;
  } catch (e) {
    if (e instanceof OPError) console.warn(e.message, e.response?.body || "");
    throw e;
  }
}
