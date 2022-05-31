import type { NextApiRequest, NextApiResponse } from "next";
import { idporten } from "../../lib/providers";
import { getSession } from "../../lib/server/get-session";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await getSession(idporten, { req });
  if (!session) return res.status(401);

  const { sub } = session.user;

  res.status(200).send(`Authenticated as ${sub}`);
}
