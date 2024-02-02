import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../lib/provider";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  let obo = "";
  if (process.env.PROVIDER == "idporten") {
    obo = await session.apiToken("dev-gcp:teamdagpenger:oasis-idporten");
  } else if (process.env.PROVIDER == "azure") {
    obo = await session.apiToken(
      "api://dev-gcp.teamdagpenger.oasis-azure/.default",
    );
  }

  res.status(200).send(`Made obo-token request: got ${obo.length}`);
}
