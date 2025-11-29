// back/core/src/shared/db/index.ts
import { Client } from "postgres";
import { getDbConfig } from "./config.ts";

export async function connectToModuleDB(moduleName: string) {
  const config = getDbConfig(moduleName);
  const client = new Client({
    user: config.user,
    password: config.password,
    database: config.database,
    hostname: config.host,
    port: config.port,
  });

  await client.connect();
  console.log(`✅ Connected to database: ${config.database}`);
  return client;
}
