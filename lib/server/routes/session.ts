import { NextApiHandler, NextApiRequest } from "next";
import { getSession } from "../../client";

const session: NextApiHandler = async (req: NextApiRequest, res) => {
  const { token, payload } = await getSession({ req });

  if (!token) {
    res.status(401).end();
    return;
  }

  const expiresIn = payload.exp - Date.now();
  res.json({ expires_in: expiresIn });
};

export default session;
