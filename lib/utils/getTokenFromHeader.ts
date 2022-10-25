import { IncomingHttpHeaders } from "http";

export function getTokenFromHeader(
  headers: IncomingHttpHeaders
): string | null {
  if (headers.authorization == null) return null;
  if (!headers.authorization.includes("Bearer")) return null;
  return headers.authorization.split(" ")[1];
}
