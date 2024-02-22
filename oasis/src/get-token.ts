import { IncomingMessage } from "http";

export const getToken = (
  val: Request | IncomingMessage | Headers | string,
): string | undefined => {
  if (typeof val === "string") {
    return val.startsWith("Bearer ") ? stripBearer(val) : val;
  } else if (val instanceof Headers) {
    return getTokenFromHeaders(val);
  } else if (val.headers instanceof Headers) {
    return getTokenFromHeaders(val.headers);
  } else {
    const authHeader = val.headers?.authorization;
    return authHeader ? stripBearer(authHeader) : undefined
  }
};

function getTokenFromHeaders(headers: Headers): string | undefined {
  const authHeader = headers.get("authorization");
  return authHeader ? stripBearer(authHeader) : undefined;
}

function stripBearer(token: string): string {
  return token.replace("Bearer ", "");
}
