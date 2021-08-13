import passport from "../middlewares/passport.mw";

const successRedirect = process.env.LOGINSERVICE_URL
  ? `${process.env.LOGINSERVICE_URL}?redirect=${process.env.SELF_URL}`
  : "/";

export default function callback(req, res) {
  return passport.authenticate("idporten", {
    successRedirect,
    failureRedirect: "/?failure",
  })(req, res);
}
