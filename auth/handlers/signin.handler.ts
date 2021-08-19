import passport from "../middlewares/passport.mw";

export default function signin(req, res) {
  console.log("SIGNIN", req.options);
  return passport.authenticate("idporten")(req, res);
}
