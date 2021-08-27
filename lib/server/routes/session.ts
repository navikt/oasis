import { NextApiHandler, NextApiRequest } from "next";
import { getSession } from "../../client";

const session: NextApiHandler = async (req: NextApiRequest, res) => {
  const { token } = await getSession({ req });

  if (!token) {
    res.status(401).end();
    return;
  }

  res.json({});
};

export default session;
