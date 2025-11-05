import { Pool } from "postgres/mod.ts";
import { env } from "./env.ts";

export const db = new Pool(env.PG_URL, 5, true);

export async function query<T = unknown>(sql: string, params: unknown[] = []) {
  const conn = await db.connect();
  try {
    const result = await conn.queryObject<T>({ text: sql, args: params });
    return result.rows;
  } finally {
    conn.release();
  }
}
