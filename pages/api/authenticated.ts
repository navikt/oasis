import type { NextApiRequest, NextApiResponse } from "next";
import { decodeJwt } from "../../lib";
import { getSession } from "../../lib/provider";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  const { sub } = decodeJwt(session.token);

  res.status(200).send(`Authenticated as ${sub}`);
}
