import { IncomingHttpHeaders } from "http";

export function getTokenFromHeader(
  headers: IncomingHttpHeaders | Headers
): string | null {
  const bearer = getBearer(headers);
  if (bearer == null) return null;
  if (!bearer.includes("Bearer")) return null;
  return bearer.split(" ")[1];
}

function getBearer(headers: IncomingHttpHeaders | Headers): String | null {
  if ("authorization" in headers) {
    return headers.authorization || null;
  }
  if (headers instanceof Headers && "get" in headers) {
    return headers.get("authorization") || null;
  }

  return null;
}
