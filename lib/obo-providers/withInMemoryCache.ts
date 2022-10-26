import { OboProvider } from "../index";
import NodeCache from "node-cache";
import { decodeJwt, JWTPayload } from "jose";
import { secondsUntil } from "../utils/secondsUntil";
import EventEmitter from "events";

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
  minExpire?: number;
  cacheHit?: (key: string) => void;
  cacheMiss?: (key: string) => void;
}

export function withInMemoryCache(
  oboProvider: OboProvider,
  { minExpire, cacheHit, cacheMiss }: CacheOptions = {}
): OboProvider {
  const cache = getCache();
  const emitter = new EventEmitter();

  if (cacheHit) emitter.on("cache-hit", cacheHit);
  if (cacheMiss) emitter.on("cache-miss", cacheMiss);

  return async (token, audience) => {
    const key = `${token}-${audience}`;
    const cachedToken = cache.get<string>(key);
    if (cachedToken) {
      emitter.emit("cache-hit", key);
      return cachedToken;
    }
    emitter.emit("cache-miss", key);

    const oboToken = await oboProvider(token, audience);
    if (!oboToken) return null;

    const payload = decodeJwt(oboToken);
    const ttl = getSecondsToExpire(payload);
    if (ttl > (minExpire ?? 0)) {
      cache.set(key, oboToken, ttl);
    }

    return oboToken;
  };
}
