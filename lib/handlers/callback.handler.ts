import passport from "../middleware/passport.mw";
import { AuthedNextApiRequest } from "../middleware";

export default function callback(req: AuthedNextApiRequest, res, next) {
  const { loginServiceUrl, selfUrl } = req.options;
  const successRedirect = loginServiceUrl
    ? `${loginServiceUrl}?redirect=${selfUrl}`
    : "/";
  return passport.authenticate("idporten", {
    successRedirect,
    failureRedirect: "/?failure",
  })(req, res, next);
}
