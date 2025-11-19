// back/core/src/main.ts
import { Application } from "@oak/oak";

// Customer Accounts
import customerRouter from "./modules/customer-accounts/controllers/customer.controller.ts";
import addressRouter from "./modules/customer-accounts/controllers/address.controller.ts";
import orderRefRouter from "./modules/customer-accounts/controllers/order-ref.controller.ts";

// Store Management
import storeRouter from "./modules/store-management/controllers/store.controller.ts";
import brandingRouter from "./modules/store-management/controllers/branding.controller.ts";
import settingsRouter from "./modules/store-management/controllers/settings.controller.ts";
import categoryRouter from "./modules/store-management/controllers/category.controller.ts";

// Order Management
import orderRouter from "./modules/order-management/controllers/order.controller.ts";
import orderItemRouter from "./modules/order-management/controllers/order-item.controller.ts";
import paymentRouter from "./modules/order-management/controllers/payment.controller.ts";
import orderLifecycleRouter from "./modules/order-management/controllers/order-lifecycle.controller.ts";
import orderStatusEventRouter from "./modules/order-management/controllers/order-status-event.controller.ts";

const app = new Application();

// --------------------------------
// Customer Accounts
// --------------------------------
app.use(customerRouter.routes());
app.use(customerRouter.allowedMethods());

app.use(addressRouter.routes());
app.use(addressRouter.allowedMethods());

app.use(orderRefRouter.routes());
app.use(orderRefRouter.allowedMethods());

// --------------------------------
// Store Management
// --------------------------------
app.use(storeRouter.routes());
app.use(storeRouter.allowedMethods());

app.use(brandingRouter.routes());
app.use(brandingRouter.allowedMethods());

app.use(settingsRouter.routes());
app.use(settingsRouter.allowedMethods());

app.use(categoryRouter.routes());
app.use(categoryRouter.allowedMethods());

// --------------------------------
// Order Management
// --------------------------------
app.use(orderRouter.routes());
app.use(orderRouter.allowedMethods());

app.use(orderItemRouter.routes());
app.use(orderItemRouter.allowedMethods());

app.use(paymentRouter.routes());
app.use(paymentRouter.allowedMethods());

app.use(orderLifecycleRouter.routes());
app.use(orderLifecycleRouter.allowedMethods());

app.use(orderStatusEventRouter.routes());
app.use(orderStatusEventRouter.allowedMethods());

// --------------------------------
// Start server
// --------------------------------
console.log("🚀 Server running on http://localhost:8000");
await app.listen({ port: 8000 });
