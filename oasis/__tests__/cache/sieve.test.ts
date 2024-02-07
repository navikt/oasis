import SieveCache from "../../src/cache/sieve";

describe("SieveCache", () => {
  describe("Initialization", () => {
    it("should initialize with the given capacity", () => {
      const capacity = 3;
      const cache = new SieveCache(capacity);
      expect(cache.capacity).toBe(capacity);
      expect(cache.size).toBe(0);
    });

    it("should throw an error if capacity is less than or equal to 0", () => {
      expect(() => new SieveCache(0)).toThrowError(
        "Capacity must be greater than 0",
      );
      expect(() => new SieveCache(-1)).toThrowError(
        "Capacity must be greater than 0",
      );
    });
  });

  describe("set and get with TTL", () => {
    it("should set and get values correctly with TTL", () => {
      const cache = new SieveCache(2);

      cache.set("key1", "value1", 1000); // TTL: 1 second
      expect(cache.get("key1")).toBe("value1");

      cache.set("key2", "value2", 2000); // TTL: 2 seconds
      expect(cache.get("key2")).toBe("value2");
    });

    it("should evict expired items based on TTL", async () => {
      const cache = new SieveCache(2);

      cache.set("key1", "value1", 1000); // TTL: 1 second
      cache.set("key2", "value2", 2000); // TTL: 2 seconds

      // Wait for items to expire
      await new Promise((resolve) => setTimeout(resolve, 1500));

      expect(cache.get("key1")).toBeUndefined(); // key1 should be expired and evicted
      expect(cache.get("key2")).toBe("value2"); // key2 should still be valid
    });

    it("should handle setting items with TTL and non-TTL together", async () => {
      const cache = new SieveCache(2);

      cache.set("key1", "value1", 1000); // TTL: 1 second
      cache.set("key2", "value2");

      // Wait for items to expire
      await new Promise((resolve) => setTimeout(resolve, 1500));

      expect(cache.get("key1")).toBeUndefined(); // key1 should be expired and evicted
      expect(cache.get("key2")).toBe("value2"); // key2 should still be valid
    });
  });

  describe("Edge cases", () => {
    it("should handle getting a non-existent key", () => {
      const cache = new SieveCache(2);
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should handle setting a key with a falsy value", () => {
      const cache = new SieveCache(2);
      cache.set("key", 0);
      expect(cache.get("key")).toBe(0);
    });

    it("should handle setting an empty string as a key", () => {
      const cache = new SieveCache(2);
      cache.set("", "empty");
      expect(cache.get("")).toBe("empty");
    });
  });
});
