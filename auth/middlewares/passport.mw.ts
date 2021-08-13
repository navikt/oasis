import { IncomingMessage, ServerResponse } from "http";
import RequestHandler from "micro";
import passport from "passport";
import idporten from "./strategy/idporten";
import { TokenSet } from "openid-client";

export type User = {
  fnr: string;
  locale: string;
  tokenset: TokenSet;
  tokenFor?: (audience: string) => Promise<string>;
};

passport.serializeUser((user: User, done) => {
  return done(null, user);
});
passport.deserializeUser((savedUser: User, done) => {
  const user: User = {
    ...savedUser,
    tokenset: new TokenSet(savedUser.tokenset),
  };
  return done(null, user);
});

export async function initializeIdporten(
  req: IncomingMessage,
  res: ServerResponse,
  next: RequestHandler
): Promise<void> {
  // @ts-ignore: Vi må bryte enkapsulering for å sjekke om passport allerede er konfigurert
  if (passport._strategy("idporten")) {
    return next();
  }
  passport.use("idporten", await idporten());
  return next();
}

export default passport;
