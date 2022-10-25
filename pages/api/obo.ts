import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../lib/provider";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  let audience: string;
  if (process.env.PROVIDER == "idporten") {
    audience = "dp-auth-azure";
  } else {
    audience = "dp-auth-idporten";
  }
  const obo = session.getTokenFor(audience);

  res.status(200).send(`Made obo-token for ${audience}. Size=${obo.length}`);
}
