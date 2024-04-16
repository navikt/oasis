class Node {
  key: string;
  value: string;
  visited: boolean;
  prev: Node | null;
  next: Node | null;
  expirationTime: number;

  constructor(key: string, value: string, expirationTime: number) {
    this.key = key;
    this.value = value;
    this.visited = false;
    this.prev = null;
    this.next = null;
    this.expirationTime = expirationTime; // TTL in seconds
  }

  hasExpired(): boolean {
    return Date.now() / 1000 > this.expirationTime;
  }
}

// Implementation of a Sieve Cache
// https://cachemon.github.io/SIEVE-website/blog/2023/12/17/sieve-is-simpler-than-lru/
class SieveCache {
  capacity: number;
  private cache: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;
  private hand: Node | null;
  size: number;

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("Capacity must be greater than 0");
    this.capacity = capacity;
    this.cache = new Map(); // To store cache items as {value: node}
    this.head = null;
    this.tail = null;
    this.hand = null;
    this.size = 0;
  }

  private addToHead(node: Node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (this.tail === null) {
      this.tail = node;
    }
  }

  private removeNode(node: Node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evict() {
    const nodeToEvict = this.findNodeToEvict();
    if (!nodeToEvict) return;
    this.hand = nodeToEvict.prev ? nodeToEvict.prev : null;
    this.deleteNode(nodeToEvict);
  }

  private findNodeToEvict(): Node | null {
    let node = this.hand || this.tail;
    while (node && node.visited) {
      node.visited = false;
      node = node.prev || null;
    }
    return node;
  }

  private deleteNode(node: Node) {
    this.cache.delete(node.key);
    this.removeNode(node);
    this.size -= 1;
  }

  get(key: string): string | undefined {
    const node = this.cache.get(key);
    if (node) {
      if (node.hasExpired()) {
        this.deleteNode(node);
        return undefined;
      }
      node.visited = true;
    }
    return node?.value;
  }

  set(key: string, value: string, ttl: number = 0) {
    if (this.size === this.capacity) {
      // Cache Full
      this.evict(); // Eviction
    }

    const expirationTime = ttl > 0 ? Date.now() / 1000 + ttl : Infinity;
    const node = new Node(key, value, expirationTime);
    this.addToHead(node);
    this.cache.set(key, node);
    this.size += 1;
    node.visited = false; // Insertion
    return node;
  }
}

export default SieveCache;
