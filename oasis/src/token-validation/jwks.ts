import { createRemoteJWKSet } from "jose";

const remoteJWKSetCache: Record<
  string,
  ReturnType<typeof createRemoteJWKSet>
> = {};
export function getJwkSet(
  jwksUri: string,
): ReturnType<typeof createRemoteJWKSet> {
  if (remoteJWKSetCache[jwksUri] == null) {
    remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri));
  }

  return remoteJWKSetCache[jwksUri];
}
