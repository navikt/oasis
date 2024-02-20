import { validateToken } from "@navikt/oasis";
import { decodeJwt } from "jose";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const token = req.headers.authorization!.replace("Bearer ", "");

  const result = await validateToken(token);
  if (result.ok) {
    res.status(200).send(`Authenticated as ${decodeJwt(token).sub}`);
  } else {
    res.status(401);
  }
}
