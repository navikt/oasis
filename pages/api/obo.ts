import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../lib/provider";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  const obo = await session.apiToken("dummy audience that fails");

  res.status(200).send(`Made obo-token request`);
}
