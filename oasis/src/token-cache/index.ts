import { createHash } from "node:crypto";
import { OboProvider } from "../obo";
import { ClientCredientialsProvider } from "../client-credentials";
import { expiresIn } from "../expires-in";
import SieveCache from "./cache";
import { TokenResult } from "../token-result";
import { Counter, Histogram } from "prom-client";

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export class CacheMetrics {
  public cacheHits = new Counter({
    name: "oasis_cache_hits_total",
    help: "Total number of cache hits",
    labelNames: ["provider"],
  });

  public cacheMisses = new Counter({
    name: "oasis_cache_misses_total",
    help: "Total number of cache misses",
    labelNames: ["provider"],
  });
}

const cacheMetricsSymbols: unique symbol = Symbol.for("CacheMetrics");

type CacheMetricsGlobal = typeof global & {
  [cacheMetricsSymbols]: CacheMetrics;
};

(global as CacheMetricsGlobal)[cacheMetricsSymbols] =
  (global as CacheMetricsGlobal)[cacheMetricsSymbols] || new CacheMetrics();

const prometheus = (global as CacheMetricsGlobal)[cacheMetricsSymbols];

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
    const provider = oboProvider.name;

    if (cachedToken) {
      prometheus.cacheHits.labels({ provider }).inc();
      return Promise.resolve(TokenResult.Ok(cachedToken));
    }

    prometheus.cacheMisses.labels({ provider }).inc();
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
