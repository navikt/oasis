import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nc, { NextConnect } from "next-connect";
import passport, { initializeIdporten, User } from "./passport.mw";
import session from "./session.mw";
import tokenx from "./tokenx.mw";
import { ConfiguredRequest } from "../index";

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

export interface AuthedNextApiRequest extends ConfiguredRequest {
  user: User;
  logout: () => void;
  logOut: () => void;
  login: () => void;
  logIn: () => void;
  isAuthenticated: () => boolean;
}
