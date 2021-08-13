import callback from "./callback.handler";
import session from "./session.handler";
import signin from "./signin.handler";
import signout from "./signout.handler";
import { withMiddleware } from "../middlewares";

export default {
  callback: withMiddleware(callback),
  signin: withMiddleware(signin),
  signout: withMiddleware(signout),
  session: withMiddleware(session),
};
