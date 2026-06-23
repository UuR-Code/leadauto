import { Queue } from "bullmq"

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" }

// Lazy queue instances — only created when needed (not at module load time during build)
let _scrapeQueue: Queue | null = null
let _buildPageQueue: Queue | null = null
let _deployQueue: Queue | null = null
let _emailQueue: Queue | null = null

export function getScrapeQueue() {
  return (_scrapeQueue ??= new Queue("scrape", { connection }))
}
export function getBuildPageQueue() {
  return (_buildPageQueue ??= new Queue("build-page", { connection }))
}
export function getDeployQueue() {
  return (_deployQueue ??= new Queue("deploy", { connection }))
}
export function getEmailQueue() {
  return (_emailQueue ??= new Queue("email", { connection }))
}

// Keep named exports for workers (they import at runtime, not build time)
export const scrapeQueue = { add: (...args: Parameters<Queue["add"]>) => getScrapeQueue().add(...args) }
export const buildPageQueue = { add: (...args: Parameters<Queue["add"]>) => getBuildPageQueue().add(...args) }
export const deployQueue = { add: (...args: Parameters<Queue["add"]>) => getDeployQueue().add(...args) }
export const emailQueue = { add: (...args: Parameters<Queue["add"]>) => getEmailQueue().add(...args) }

export type ScrapeJobData = {
  campaignId: string
  sector: string
  city: string
  district: string
  targetCount: number
}

export type BuildPageJobData = { firmId: string }
export type DeployJobData = { firmId: string }
export type EmailJobData = { firmId: string }
