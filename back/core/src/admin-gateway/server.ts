import { Hono } from "@hono/hono";
import { env } from "../config/env.ts";
//import { auth } from "./middlewares/auth.middleware.ts";
import { ordersRoutes } from "./routes/orders.routes.ts";
import { storesRoutes } from "./routes/stores.routes.ts";
import { accountsRoutes } from "./routes/accounts.routes.ts";
import { webhooksRoutes } from "./routes/webhooks.routes.ts";

const app = new Hono();
//app.use("*", auth);

app.route("/orders", ordersRoutes);
app.route("/stores", storesRoutes);
app.route("/accounts", accountsRoutes);
app.route("/webhooks", webhooksRoutes);

console.log(`🚀 Admin Gateway running on port ${env.PORT}`);
Deno.serve({ port: env.PORT }, app.fetch);
