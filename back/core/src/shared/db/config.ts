// back/core/src/shared/db/config.ts
import { load } from "@std/dotenv";

await load({ export: true, envPath: "./back/core/.env" });

export function getDbConfig(moduleName: string) {
  const host = Deno.env.get("PG_HOST")!;
  const user = Deno.env.get("PG_USER")!;
  const password = Deno.env.get("PG_PASS")!;
  const port = Number(Deno.env.get("PG_PORT") ?? 5432);

  const dbMap: Record<string, string> = {
    "customer-accounts": Deno.env.get("DB_CUSTOMER_ACCOUNTS")!,
    "order-management": Deno.env.get("DB_ORDER_MANAGEMENT")!,
    "store-management": Deno.env.get("DB_STORE_MANAGEMENT")!,
    "event-webhooks": Deno.env.get("DB_EVENT_WEBOOKS")!, 
    "products": Deno.env.get("DB_PRODUCTS")!,
  };

  const database = dbMap[moduleName];
  if (!database) {
    throw new Error(`Database not configured for module: ${moduleName}`);
  }

  return { host, user, password, port, database };
}
