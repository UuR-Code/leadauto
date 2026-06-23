import { scrapeWorker } from "./scrape.worker"
import { buildPageWorker } from "./build-page.worker"
import { deployWorker } from "./deploy.worker"
import { emailWorker } from "./email.worker"

console.log("🚀 Workers started")
console.log("  ✓ scrape")
console.log("  ✓ build-page")
console.log("  ✓ deploy")
console.log("  ✓ email")

process.on("SIGTERM", async () => {
  await Promise.all([
    scrapeWorker.close(),
    buildPageWorker.close(),
    deployWorker.close(),
    emailWorker.close(),
  ])
  process.exit(0)
})
