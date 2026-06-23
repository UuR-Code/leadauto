import { Queue } from "bullmq"

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" }

export const scrapeQueue = new Queue("scrape", { connection })
export const buildPageQueue = new Queue("build-page", { connection })
export const deployQueue = new Queue("deploy", { connection })
export const emailQueue = new Queue("email", { connection })

export type ScrapeJobData = {
  campaignId: string
  sector: string
  city: string
  district: string
  targetCount: number
}

export type BuildPageJobData = {
  firmId: string
}

export type DeployJobData = {
  firmId: string
}

export type EmailJobData = {
  firmId: string
}
