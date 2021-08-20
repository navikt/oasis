import passport from "../middleware/passport.mw";
import { generators } from "openid-client";

export default function signin(req, res) {
  // @ts-ignore: Passport sender ukjente options videre til underliggende Strategy
  return passport.authenticate("idporten", { nonce: generators.nonce() })(
    req,
    res
  );
}
