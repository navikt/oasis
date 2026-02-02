import { createRemoteJWKSet } from "jose";

const ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

const remoteJWKSetCache: Record<
  string,
  ReturnType<typeof createRemoteJWKSet>
> = {};
export function getJwkSet(
  jwksUri: string,
): ReturnType<typeof createRemoteJWKSet> {
  if (remoteJWKSetCache[jwksUri] == null) {
    remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri), {
      cacheMaxAge: ONE_DAY_IN_MILLIS,
    });
  }

  return remoteJWKSetCache[jwksUri];
}
