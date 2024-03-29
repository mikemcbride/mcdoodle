export default {
  schema: "./db/schema/*",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_DB_AUTH_TOKEN,
  },
  out: "./db/migrations"
}
