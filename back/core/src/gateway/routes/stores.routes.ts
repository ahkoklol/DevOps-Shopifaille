import { Hono } from "hono/mod.ts";
import { buildStoreManagementRouter } from "../modules/store-management/router.hono.ts";

export function buildStoresRoutes() {
  const r = new Hono();

  r.route("/", buildStoreManagementRouter());

  return r;
}


export const storesRoutes = new Hono();