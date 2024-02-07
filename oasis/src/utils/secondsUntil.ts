function getNow(timestamp: number) {
  const now = Date.now();
  if (Math.abs(now - timestamp) < Math.abs(now - timestamp * 1000)) {
    return now;
  } else {
    return Math.round(now / 1000);
  }
}

export function secondsUntil(timestamp: number): number {
  if (timestamp <= 0) return 0;
  const now = getNow(timestamp);
  if (timestamp <= now) return 0;
  return Math.round(timestamp - now);
}
