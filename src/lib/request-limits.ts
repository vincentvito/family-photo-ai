const WINDOW_MS = 60_000;

const attempts = new Map<string, number[]>();

export function getClientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function isRateLimited(key: string, max: number, windowMs = WINDOW_MS) {
  const redis = upstashConfig();
  if (redis) {
    return isUpstashRateLimited(redis, key, max, windowMs);
  }

  return isInMemoryRateLimited(key, max, windowMs);
}

async function isUpstashRateLimited(
  redis: { url: string; token: string },
  key: string,
  max: number,
  windowMs: number,
) {
  const bucket = Math.floor(Date.now() / windowMs);
  const redisKey = `ratelimit:${key}:${bucket}`;
  const ttlSeconds = Math.max(1, Math.ceil((windowMs * 2) / 1000));

  try {
    const res = await fetch(`${redis.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redis.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, ttlSeconds],
      ]),
    });

    if (!res.ok) {
      console.warn(`Upstash rate limit failed with ${res.status}; using in-memory fallback.`);
      return isInMemoryRateLimited(key, max, windowMs);
    }

    const data = (await res.json()) as Array<{ result?: unknown }>;
    const count = Number(data[0]?.result ?? 0);
    return count > max;
  } catch (err) {
    console.warn("Upstash rate limit failed; using in-memory fallback.", err);
    return isInMemoryRateLimited(key, max, windowMs);
  }
}

function isInMemoryRateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= max) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);
  return false;
}

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}
