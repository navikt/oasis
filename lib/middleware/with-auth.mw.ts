import { AuthModuleConfig } from "../auth-config";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nc, { NextConnect } from "next-connect";
import { ConfiguredRequest } from "../index";
import middleware from "./index";

function withAuth(config: AuthModuleConfig) {
  return (
    handler: NextApiHandler
  ): NextConnect<NextApiRequest, NextApiResponse> => {
    return nc()
      .use((req: ConfiguredRequest, res, next) => {
        req.options = config;
        return next();
      })
      .use(middleware)
      .use(handler);
  };
}

export { withAuth };
