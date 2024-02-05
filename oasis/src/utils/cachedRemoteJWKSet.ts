import memoize from "lodash.memoize";
import { createRemoteJWKSet, JWTVerifyGetKey } from "jose";

export const cachedRemoteJWKSet: (remoteJWKS: string) => JWTVerifyGetKey =
  memoize((remoteJWKS: string) => {
    return createRemoteJWKSet(new URL(remoteJWKS));
  });
