import session, { SessionOptions } from "express-session";
import connectRedis, { RedisStore } from "connect-redis";
import redisClient from "./storage/redis";

const Store: RedisStore = connectRedis(session);

const SESSION_MAX_AGE_MILLISECONDS = 60 * 60 * 1000;

const options: SessionOptions = {
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  unset: "destroy",
  cookie: {
    maxAge: SESSION_MAX_AGE_MILLISECONDS,
    sameSite: "lax",
    httpOnly: true,
    secure: false,
  },
};

if (process.env.NODE_ENV !== "development") {
  options.cookie.secure = true;
  options.proxy = true;
}

if (process.env.SESSION_REDIS === "true") {
  options.store = new Store({
    client: redisClient(),
    disableTouch: true,
  });
}

export default session(options);
