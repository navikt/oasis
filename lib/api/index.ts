import * as routes from "../api/routes";
import { NextApiHandler } from "next";

export type DpAuthConfig = {
  allowedDestinations?: string[];
};

const defaultConfig: DpAuthConfig = {
  allowedDestinations: ["/"],
};

const DpAuthHandler = (req, res, config?: DpAuthConfig) => {
  req.options = {
    ...defaultConfig,
    ...config,
  };

  const { auth } = req.query;
  if (!auth) {
    const error = "Fila må kalles [...auth].js";
    console.error(error);
    return res.status(500).end(`Error: ${error}`);
  }

  const endpoint = auth[0];
  if (req.method === "GET") {
    switch (endpoint) {
      case "signin":
        return routes.signin(req, res);
      case "session":
        return routes.session(req, res);
    }
  }

  return res
    .status(400)
    .end(`Error: HTTP ${req.method} er ikke støttet for ${req.url}`);
};

export default function DpAuth(
  ...args: Parameters<NextApiHandler> | DpAuthConfig[]
): NextApiHandler {
  if (args.length === 1) {
    return (req, res) => DpAuthHandler(req, res, args[0]);
  }

  return DpAuthHandler(...(args as Parameters<NextApiHandler>));
}
