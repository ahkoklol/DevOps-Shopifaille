// back/core/src/main.ts
import { Application } from "@oak/oak";
import customerRouter from "./modules/customer-accounts/controllers/customer.controller.ts";
import addressRouter from "./modules/customer-accounts/controllers/address.controller.ts";
import orderRefRouter from "./modules/customer-accounts/controllers/order-ref.controller.ts";

const app = new Application();

// Routes modules
app.use(customerRouter.routes());
app.use(customerRouter.allowedMethods());

app.use(addressRouter.routes());
app.use(addressRouter.allowedMethods());

app.use(orderRefRouter.routes());
app.use(orderRefRouter.allowedMethods());

// Start server
console.log("🚀 Server running on http://localhost:8000");
await app.listen({ port: 8000 });
