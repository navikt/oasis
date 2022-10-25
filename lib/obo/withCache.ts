import { OboProvider } from "../index";
import NodeCache from "node-cache";
import { decodeJwt, JWTPayload } from "jose";
import { secondsUntil } from "../utils/secondsUntil";

let cache: NodeCache;

function getCache() {
  if (cache == undefined) {
    cache = new NodeCache();
  }
  return cache;
}

const NO_CACHE_TTL = 0;

function getSecondsToExpire(payload: JWTPayload) {
  return Math.max(
    payload.exp ? secondsUntil(payload.exp) : NO_CACHE_TTL,
    NO_CACHE_TTL
  );
}

export interface CacheOptions {
  minExpire: number;
}

export function withCache(
  oboProvider: OboProvider,
  { minExpire }: CacheOptions = { minExpire: 0 }
): OboProvider {
  const cache = getCache();
  return async (token, audience) => {
    const key = `${token}-${audience}`;
    const cachedToken = cache.get<string>(key);
    if (cachedToken) return cachedToken;

    const oboToken = await oboProvider(token, audience);
    if (!oboToken) return null;

    const payload = decodeJwt(oboToken);
    const ttl = getSecondsToExpire(payload);
    if (ttl > minExpire) {
      cache.set(key, oboToken, ttl);
    }

    return oboToken;
  };
}
