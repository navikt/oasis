import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nc, { NextConnect } from "next-connect";
import passport, { initializeIdporten, User } from "./passport.mw";
import session from "./session.mw";
import tokenx from "./tokenx.mw";

const middleware = nc();

middleware
  .use(session)
  .use(initializeIdporten)
  .use(passport.initialize()) // passport middleware handles authenthentication, which populates req.user
  .use(passport.session())
  .use(tokenx);

export default middleware;

export function withMiddleware(
  handler: NextApiHandler
): NextConnect<NextApiRequest, NextApiResponse> {
  return nc().use(middleware).use(handler);
}

export interface AuthedNextApiRequest extends NextApiRequest {
  user: User;
  logout: () => void;
  logOut: () => void;
  login: () => void;
  logIn: () => void;
  isAuthenticated: () => boolean;
}

export function env(key: string): string {
  if (!(key in process.env)) {
    throw new Error(`Kunne ikke finne ${key} i process.env`);
  }
  return process.env[key];
}
