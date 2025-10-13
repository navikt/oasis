import { createHash } from "node:crypto";
import { OboProvider } from "../obo";
import { ClientCredientialsProvider } from "../client-credentials";
import { expiresIn } from "../expires-in";
import SieveCache from "./cache";
import { TokenResult } from "../token-result";

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

let cache: SieveCache;
function getCache() {
  if (!cache) {
    const averageJwtSize = 1024; // bytes
    const maxCacheSize = 128 /* MB */ * 1024 /* KB */ * 1024; /* bytes */
    const maxCacheCapacity = Math.floor(maxCacheSize / averageJwtSize);

    cache = new SieveCache(maxCacheCapacity);
  }
  return cache;
}

export function withCache(
  clientCredentialsProvider: ClientCredientialsProvider,
): ClientCredientialsProvider;
export function withCache(clientCredentialsProvider: OboProvider): OboProvider;
export function withCache(
  oboProvider: ClientCredientialsProvider | OboProvider,
): ClientCredientialsProvider | OboProvider {
  return async (token, audience) => {
    const cache = getCache();
    const key = sha256(token + audience);
    const cachedToken = cache.get(key);

    if (cachedToken) {
      return Promise.resolve(TokenResult.Ok(cachedToken));
    }

    return oboProvider(token, audience).then((result) => {
      if (result.ok) {
        try {
          const leeway = 5; // seconds
          const ttl = expiresIn(result.token) - leeway;
          if (ttl > 0) {
            cache.set(key, result.token, ttl);
          }
        } catch (e) {
          console.warn(e);
        }
      }

      return result;
    });
  };
}
