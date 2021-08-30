import { NextApiHandler, NextApiRequest } from "next";
import { getSession } from "../../client";

const session: NextApiHandler = async (req: NextApiRequest, res) => {
  const { token, payload } = await getSession({ req });

  if (!token) {
    res.status(401).end();
    return;
  }

  const expires_in = payload.exp - Date.now() / 1000;
  res.json({ expires_in });
};

export default session;
