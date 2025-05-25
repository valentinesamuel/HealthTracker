import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const runMigration = async () => {
  const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(connection);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "migrations" });

  console.log("Migrations completed!");

  await connection.end();
};

runMigration().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
