import { NextApiHandler, NextApiRequest } from "next";
import { getSession } from "../../server";
import { Session } from "../../client";

const sessionHandler: NextApiHandler<Session> = async (
  req: NextApiRequest,
  res
) => {
  const { token, payload } = await getSession({ req });

  if (!token) {
    res.status(401).end();
    return;
  }

  const expires_in = Math.round(payload.exp - Date.now() / 1000);
  res.json({ expires_in });
};

export default sessionHandler;
