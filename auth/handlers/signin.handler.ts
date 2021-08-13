import passport from "../middlewares/passport.mw";

export default function signin(req, res) {
  return passport.authenticate("idporten")(req, res);
}
