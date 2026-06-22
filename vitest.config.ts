import { defineConfig } from 'vitest/config'

// Standalone test config (takes precedence over vite.config.ts, so the
// Start/Cloudflare plugins don't load). Tests run in Node; the API handlers
// are exercised against a real D1 provided by Miniflare (see test/helpers.ts).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
})
