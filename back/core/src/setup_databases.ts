import { Client } from "postgres";
import { load } from "@std/dotenv";
import { walk } from "@std/fs";

await load({ export: true, envPath: "./back/core/.env" });

const rootClient = new Client({
  user: Deno.env.get("PG_USER")!,
  password: Deno.env.get("PG_PASS")!,
  database: "postgres",
  hostname: Deno.env.get("PG_HOST")!,
  port: Number(Deno.env.get("PG_PORT") ?? 5432),
});

await rootClient.connect();
console.log("📦 Connected to PostgreSQL root");

const databases = [
  Deno.env.get("DB_CUSTOMER_ACCOUNTS")!,
  Deno.env.get("DB_ORDER_MANAGEMENT")!,
  Deno.env.get("DB_STORE_MANAGEMENT")!,
  Deno.env.get("DB_EVENT_WEBHOOKS")!,
  Deno.env.get("DB_PRODUCTS")!,
];

for (const dbName of databases) {
  await rootClient.queryArray(
    `CREATE DATABASE ${dbName} WITH OWNER ${Deno.env.get("PG_USER")}`,
  );
  console.log(`✅ Created database ${dbName}`);
}

await rootClient.end();

// --- Initialise chaque module ---
for await (const entry of walk("./back/core/src/modules", { maxDepth: 1 })) {
  if (entry.isDirectory) {
    const sqlFile = `${entry.path}/db_init.sql`;
    try {
      const dbName = `shopifaile_${entry.name.replace("-", "_")}`;
      const client = new Client({
        user: Deno.env.get("PG_USER")!,
        password: Deno.env.get("PG_PASS")!,
        database: dbName,
        hostname: Deno.env.get("PG_HOST")!,
        port: Number(Deno.env.get("PG_PORT") ?? 5432),
      });
      await client.connect();
      const sql = await Deno.readTextFile(sqlFile);
      await client.queryArray(sql);
      await client.end();
      console.log(`🧱 Initialized schema for module: ${entry.name}`);
    } catch {
      // ignore if no SQL
    }
  }
}

console.log("🚀 All module databases initialized!");
