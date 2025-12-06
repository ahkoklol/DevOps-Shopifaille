import { Application } from "@oak/oak";

import { createCustomerRouter } from "./modules/customer-accounts/controllers/customer.controller.ts";
import { createAddressRouter } from "./modules/customer-accounts/controllers/address.controller.ts";
import { createOrderRefRouter } from "./modules/customer-accounts/controllers/order-ref.controller.ts";

import { connectToModuleDB } from "./shared/db/index.ts";

// Repositories / Services
import { CustomerRepository } from "./modules/customer-accounts/repositories/customer.repository.ts";
import { AddressRepository } from "./modules/customer-accounts/repositories/address.repository.ts";
import { OrderRefRepository } from "./modules/customer-accounts/repositories/order-ref.repository.ts";

import { CustomerService } from "./modules/customer-accounts/services/customer.service.ts";
import { AddressService } from "./modules/customer-accounts/services/address.service.ts";
import { OrderRefService } from "./modules/customer-accounts/services/order-ref.service.ts";

import { AuthRepository } from "./auth/auth.repository.ts";
import { AuthService } from "./auth/auth.service.ts";
import { createAuthRouter } from "./auth/auth.controller.ts";

// ====== LOAD MODULE DATABASES ======
const customerDb = await connectToModuleDB("customer-accounts");
const addressDb = customerDb;
const orderRefDb = customerDb;

// ====== INIT REPOSITORIES ======
const customerRepo = new CustomerRepository(customerDb);
const addressRepo = new AddressRepository(addressDb);
const orderRefRepo = new OrderRefRepository(orderRefDb);

// ====== INIT SERVICES ======
const customerService = new CustomerService(customerRepo);
const addressService = new AddressService(addressRepo);
const orderRefService = new OrderRefService(orderRefRepo);

// Auth
const authRepo = new AuthRepository(customerDb);
const authService = new AuthService(customerRepo, authRepo);

// ====== INIT ROUTERS ======
const customerRouter = createCustomerRouter(customerService);
const addressRouter = createAddressRouter(addressService);
const orderRefRouter = createOrderRefRouter(orderRefService);
const authRouter = createAuthRouter(authService);

// ====== OAK APP ======
const app = new Application();

// Generic error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

// Register routers
app.use(customerRouter.routes());
app.use(customerRouter.allowedMethods());
app.use(addressRouter.routes());
app.use(addressRouter.allowedMethods());
app.use(orderRefRouter.routes());
app.use(orderRefRouter.allowedMethods());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// ====== START HTTP SERVER ======
const port = Number(Deno.env.get("PORT") ?? 8000);

if (!Deno.env.get("DENO_TEST")) {
  console.log(`🚀 HTTP server running at http://localhost:${port}`);
  await app.listen({ port });
}

export default app;
