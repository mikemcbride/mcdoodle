import { execSync } from "child_process";

// For Cloudflare D1, we use wrangler's migration commands instead of drizzle's migrator
// because D1 database instances are only available in the Workers runtime

const args = process.argv.slice(2);
const environment = args[0] || "local"; // default to local
const databaseName = "mcdoodle";

if (environment !== "local" && environment !== "remote") {
  console.error("Usage: node db/migrate.js [local|remote]");
  console.error("  local  - Apply migrations to local D1 database");
  console.error("  remote - Apply migrations to remote D1 database");
  process.exit(1);
}

const flag = environment === "local" ? "--local" : "--remote";

try {
  console.info(`Applying migrations to ${environment} D1 database...`);
  execSync(`npx wrangler d1 migrations apply ${databaseName} ${flag} --yes`, {
    stdio: "inherit",
  });
  console.info("Migrations completed!");
} catch (err) {
  console.error("Migrations failed!", err);
  process.exit(1);
}
