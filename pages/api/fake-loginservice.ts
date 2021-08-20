import { NextApiRequest, NextApiResponse } from "next";

export default function FakeLoginservice(
  req: NextApiRequest,
  res: NextApiResponse
): NextApiResponse {
  const { redirect } = req.query;

  return res.redirect(<string>redirect);
}
