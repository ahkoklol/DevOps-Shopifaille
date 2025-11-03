import { Hono } from "hono/mod.ts";
import { buildSventWebhooksRouter } from "../modules/event-webhooks/router.hono.ts";

export function buildEventWebhooksRoutes() {
  const r = new Hono();

  r.route("/", buildEventWebhooksRouter());

  return r;
}

export const webhookRoutes = new Hono();