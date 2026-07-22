import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  console.log("running migrations from ./src/db/migrations…");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("migrations complete");

  await sql.end();
}

main().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
