import session, { SessionOptions } from "express-session";
import connectRedis, { RedisStore } from "connect-redis";
import redisClient from "./storage/redis";
import { ConfiguredRequest } from "../index";
import { SessionConfig } from "../auth-config";
import { ClientOpts } from "redis";

const Store: RedisStore = connectRedis(session);

const getOptions = (
  sessionConfig: SessionConfig,
  redisOptions: ClientOpts
): SessionOptions => {
  const options: SessionOptions = {
    secret: sessionConfig.secret,
    name: sessionConfig.name,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
      maxAge: sessionConfig.cookieMaxAgeMilliSeconds,
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    },
  };

  if (process.env.NODE_ENV !== "development") {
    options.cookie.secure = true;
    options.proxy = true;
  }

  if (sessionConfig.redis) {
    options.store = new Store({
      client: redisClient(redisOptions),
      disableTouch: true,
    });
  }

  return options;
};

function sessionMiddleware(req: ConfiguredRequest, res, next) {
  return session(
    getOptions(req.options.sessionConfig, req.options.redisConfig)
    // @ts-ignore: Ræl med type
  )(req, res, next);
}
export default sessionMiddleware;
