// back/core/src/shared/db/config.ts
import { load } from "@std/dotenv";

// Charger .env uniquement si on n'est PAS en mode test
if (!Deno.env.get("DENO_TEST")) {
  await load({ export: true, envPath: "./back/.env" });
}

export function getDbConfig(moduleName: string) {
  // Valeurs par défaut en mode test pour éviter les erreurs
  const host = Deno.env.get("PG_HOST") ?? "localhost";
  const user = Deno.env.get("PG_USER") ?? "test_user";
  const password = Deno.env.get("PG_PASS") ?? "test_pass";
  const port = Number(Deno.env.get("PG_PORT") ?? 5432);

  const dbMap: Record<string, string> = {
    "customer-accounts": Deno.env.get("DB_CUSTOMER_ACCOUNTS") ?? "test_db",
    "admin-accounts": Deno.env.get("DB_CUSTOMER_ACCOUNTS") ?? "test_db",
    "orders": Deno.env.get("DB_ORDERS") ?? "test_db",
    "store-management": Deno.env.get("DB_STORE_MANAGEMENT") ?? "test_db",
    "event-webhooks": Deno.env.get("DB_EVENT_WEBHOOKS") ?? "test_db",
  };

  const database = dbMap[moduleName];

  if (!database) {
    throw new Error(`Database not configured for module: ${moduleName}`);
  }

  return { host, user, password, port, database };
}
