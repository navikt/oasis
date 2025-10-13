import type { NextApiRequest, NextApiResponse } from "next";

export default function isAliveHandler(
  _req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  res.status(200).send("Alive");
}
