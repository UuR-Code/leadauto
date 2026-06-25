import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/.prisma/**/*",
      "node_modules/@prisma/**/*",
      "node_modules/pg/**/*",
    ],
  },
  images: {
    remotePatterns: [
      { hostname: "maps.googleapis.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default nextConfig
