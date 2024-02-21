import { IncomingMessage } from "http";

export const getToken = (
  val: Request | IncomingMessage | string,
): string | undefined => {
  if (typeof val === "string") {
    return val.startsWith("Bearer ") ? val.replace("Bearer ", "") : val;
  } else {
    const { headers } = val;
    let authHeader;
    if ("authorization" in headers) {
      authHeader = headers.authorization;
    } else if (headers instanceof Headers) {
      authHeader = headers.get("authorization");
    }
    return authHeader ? getToken(authHeader) : undefined;
  }
};
