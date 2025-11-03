import { Hono } from "hono/mod.ts";
import { buildStoresRoutes } from "./stores.routes.ts";
import { buildOrdersRoutes } from "./orders.routes.ts";
import { buildEventWebhooksRoutes } from "./webhooks.routes.ts"

const app = new Hono();

app.route("/stores", buildStoresRoutes());
app.route("/orders", buildStoresRoutes());
app.route("/webhooks", buildEventWebhooksRoutes());

// Autres routes globales de la Gateway (orders, accounts, etc.)

Deno.serve(app.fetch);
