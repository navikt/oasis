import _ from "lodash";
import { createRemoteJWKSet } from "jose";

export const cachedRemoteJWKSet = _.memoize((remoteJWKS: string) => {
  return createRemoteJWKSet(new URL(remoteJWKS));
});
