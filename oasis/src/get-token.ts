import { IncomingMessage } from "http";

export const getToken = (val: IncomingMessage | string): string | undefined => {
  if (typeof val === "string") {
    return val.startsWith("Bearer ") ? val.replace("Bearer ", "") : val;
  } else {
    return val.headers.authorization
      ? getToken(val.headers.authorization)
      : undefined;
  }
};
