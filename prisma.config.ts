import { defineConfig } from "prisma/config"

// dotenv only in non-production (build container doesn't have .env)
if (process.env.NODE_ENV !== "production") {
  try { require("dotenv").config() } catch {}
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "postgresql://dummy:dummy@localhost:5432/dummy",
  },
})
