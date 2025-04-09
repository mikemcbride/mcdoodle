export default {
  schema: "./db/schema/*",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_DB_AUTH_TOKEN,
  },
  out: "./db/migrations"
}
