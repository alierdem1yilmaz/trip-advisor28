const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory fixed-window limiter — per server instance, resets on redeploy.
 * Not distributed, but enough to deter casual abuse of an unauthenticated
 * endpoint without adding a Redis dependency for a single-instance app.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
