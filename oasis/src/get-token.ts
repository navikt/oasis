import { IncomingMessage } from "http";

export function getToken(val: string): string;
export function getToken(
  val: Request | IncomingMessage | Headers,
): string | null;
export function getToken(
  val: Request | IncomingMessage | Headers | string,
): string | null {
  if (typeof val === "string") {
    return val.startsWith("Bearer ") ? stripBearer(val) : val;
  } else if (val instanceof Headers) {
    return getTokenFromHeaders(val);
  } else if (val instanceof Request) {
    return getTokenFromHeaders(val.headers);
  } else {
    const authHeader = val.headers.authorization;
    return authHeader ? stripBearer(authHeader) : null;
  }
}

function getTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  return authHeader ? stripBearer(authHeader) : null;
}

function stripBearer(token: string): string {
  return token.replace("Bearer ", "");
}
