import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import handlers from "./handlers";
import { AuthModuleConfig } from "../auth-config";

const handler = (config: AuthModuleConfig) =>
  nc()
    .use((req: ConfiguredRequest, res, next) => {
      console.log("req", req.options);
      req.options = config;
      console.log(req.url);
      return next();
    })
    .get((req: NextApiRequest, res: NextApiResponse, next) => {
      const { auth } = req.query;
      if (!auth) {
        throw new Error("Fila må kalles [...auth].js");
        return next();
      }
      const delegatedHandler = handlers[req.query.auth[0]];

      if (delegatedHandler) {
        return delegatedHandler(req, res, next);
      }

      return res.status(404).end();
    });

export interface ConfiguredRequest extends NextApiRequest {
  options: AuthModuleConfig;
}

// TODO: Finne ut hvorfor dette eksploderer fullstendig
/*export { default as withSession } from "./react/with-session.hoc";
export { useSession } from "./react/session.hook";
export type { Session } from "./react/session.hook";*/

export default handler;
