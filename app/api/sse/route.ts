import { isAuthenticated } from "@/lib/auth"
import Redis from "ioredis"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!await isAuthenticated()) return new Response("Unauthorized", { status: 401 })

  const subscriber = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379")

  const stream = new ReadableStream({
    start(controller) {
      subscriber.subscribe("campaign:update", (err) => {
        if (err) controller.close()
      })

      subscriber.on("message", (_channel, message) => {
        controller.enqueue(`data: ${message}\n\n`)
      })
    },
    cancel() {
      subscriber.unsubscribe()
      subscriber.quit()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
