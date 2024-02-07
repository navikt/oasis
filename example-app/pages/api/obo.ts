import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@navikt/oasis";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  let obo = "";

  if (process.env.IDPORTEN_ISSUER) {
    obo = await session.apiToken("dev-gcp:oasis-maintainers:oasis-idporten");
  } else if (process.env.AZURE_OPENID_CONFIG_ISSUER) {
    obo = await session.apiToken(
      "api://dev-gcp.oasis-maintainers.oasis-azure/.default"
    );
  }

  res.status(200).send(`Made obo-token request: got ${obo.length}`);
}
