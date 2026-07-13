import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const databaseUrl = process.env.ATLAS_DATABASE_URL;
if (!databaseUrl) throw new Error("ATLAS_DATABASE_URL is required");

const migrationPath = fileURLToPath(
  new URL("../migrations/001_finance_pilot.sql", import.meta.url),
);
const migration = await readFile(migrationPath, "utf8");
const sql = postgres(databaseUrl, { max: 1 });

try {
  await sql.unsafe(migration);
} finally {
  await sql.end({ timeout: 5 });
}
