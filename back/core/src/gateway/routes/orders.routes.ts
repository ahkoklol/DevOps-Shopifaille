import { Hono } from "hono/mod.ts";
import { buildOrderManagementRouter } from "../modules/order-management/router.hono.ts";

export function buildOrdersRoutes() {
  const r = new Hono();

  r.route("/", buildOrderManagementRouter());

  return r;
}

export const ordersRoutes = new Hono();