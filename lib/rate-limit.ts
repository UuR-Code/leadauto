import { redis } from "@/lib/redis"

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds)
  return count <= limit
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0].trim() ?? "unknown"
}
