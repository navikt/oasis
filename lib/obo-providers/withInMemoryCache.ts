import { OboProvider } from "../index";
import { decodeJwt, JWTPayload } from "jose";
import { secondsUntil } from "../utils/secondsUntil";
import EventEmitter from "events";
import { splitJwt } from "../utils/splitJwt";
import SieveCache from "../cache/sieve";

let cache: SieveCache;

const averageJwtSize = 1024; // bytes
const maxCacheSize = 128 /* MB */ * 1024 /* KB */ * 1024; /* bytes */
const maxCacheCapacity = Math.floor(maxCacheSize / averageJwtSize);

function getCache() {
  if (cache == undefined) {
    console.log(`Initializing cache with capacity: ${maxCacheCapacity}`);
    cache = new SieveCache(maxCacheCapacity);
  }
  return cache;
}

const NO_CACHE_TTL = 0;

function getSecondsToExpire(payload: JWTPayload) {
  return Math.max(
    payload.exp ? secondsUntil(payload.exp) : NO_CACHE_TTL,
    NO_CACHE_TTL,
  );
}

export interface CacheOptions {
  minExpire?: number;
  cacheHit?: (token: string, audience: string) => void;
  cacheMiss?: (token: string, audience: string) => void;
}

export function withInMemoryCache(
  oboProvider: OboProvider,
  { minExpire, cacheHit, cacheMiss }: CacheOptions = {},
): OboProvider {
  const cache = getCache();
  const emitter = new EventEmitter();

  if (cacheHit) emitter.on("cache-hit", cacheHit);
  if (cacheMiss) emitter.on("cache-miss", cacheMiss);
  return async (token, audience) => {
    const { signature } = splitJwt(token);
    const key = `${signature}-${audience}`;
    const cachedToken = cache.get<string>(key);
    if (cachedToken) {
      emitter.emit("cache-hit", token, audience);
      return cachedToken;
    }
    emitter.emit("cache-miss", token, audience);

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
