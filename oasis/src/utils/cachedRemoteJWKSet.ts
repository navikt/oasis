import _ from "lodash";
import { createRemoteJWKSet, JWTVerifyGetKey } from "jose";

export const cachedRemoteJWKSet: (remoteJWKS: string) => JWTVerifyGetKey =
  _.memoize((remoteJWKS: string) => {
    return createRemoteJWKSet(new URL(remoteJWKS));
  });
