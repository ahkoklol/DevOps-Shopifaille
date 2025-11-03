// Very small per-endpoint QPS limiter (token bucket, in-memory).
export class RateLimiterService {
  private buckets = new Map<string, { tokens: number; last: number; rate: number; burst: number }>();

  constructor(private defaultRate = 10, private defaultBurst = 20) {}

  allow(endpointId: string, rate?: number) {
    const now = Date.now();
    const b = this.buckets.get(endpointId) ?? { tokens: (rate ?? this.defaultBurst), last: now, rate: (rate ?? this.defaultRate), burst: (rate ?? this.defaultBurst) };
    // Refill tokens
    const elapsed = (now - b.last) / 1000;
    b.tokens = Math.min(b.burst, b.tokens + elapsed * b.rate);
    b.last = now;
    if (b.tokens >= 1) {
      b.tokens -= 1;
      this.buckets.set(endpointId, b);
      return true;
    }
    this.buckets.set(endpointId, b);
    return false;
  }
}
