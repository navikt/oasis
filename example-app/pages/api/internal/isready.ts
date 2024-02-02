import type { NextApiRequest, NextApiResponse } from "next";

export default function isAliveHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  res.status(200).send("Ready");
}
