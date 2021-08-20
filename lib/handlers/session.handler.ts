import { NextApiResponse } from "next";
import { AuthedNextApiRequest } from "../middleware";
import { Session } from "../react/session.hook";

function makeSession(req: AuthedNextApiRequest): Session {
  if (!req.user) return null;
  const { fnr, locale, tokenset } = req.user;
  return { user: { fnr, locale }, expires_in: tokenset.expires_in };
}

export default function session(
  req: AuthedNextApiRequest,
  res: NextApiResponse<Session>
): void {
  if (!req.user) {
    return res.json({});
  }
  return res.json(makeSession(req));
}
