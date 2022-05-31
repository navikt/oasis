import client, { additionalClaims, grantBody } from "./client";
import { errors } from "openid-client";
import OPError = errors.OPError;

async function getToken(
  subject_token: string,
  audience: string
): Promise<string | undefined> {
  const _client = await client();

  try {
    const tokenset = await _client.grant(
      grantBody(audience, subject_token),
      additionalClaims()
    );
    return tokenset.access_token;
  } catch (e) {
    if (e instanceof OPError) console.warn(e.message, e.response?.body || "");
    throw e;
  }
}

const tokenx = { getToken };

export default tokenx;

export { getToken };
