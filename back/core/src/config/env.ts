export const env = {
  PORT: Number(Deno.env.get("PORT") ?? 7000),
  PG_URL: Deno.env.get("PG_URL") ?? "postgres://user:password@localhost:5432/core",
};
