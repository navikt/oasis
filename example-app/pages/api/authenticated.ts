import { decodeJwt, getSession } from "@navikt/oasis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await getSession(req);

  if (!session) return res.status(401);

  const { sub } = decodeJwt(session.token);

  res.status(200).send(`Authenticated as ${sub}`);
}
