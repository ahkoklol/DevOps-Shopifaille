import { Application } from "@oak/oak";

import { createCustomerRouter } from "./modules/customer-accounts/controllers/customer.controller.ts";
import { createAddressRouter } from "./modules/customer-accounts/controllers/address.controller.ts";
import { createOrderRefRouter } from "./modules/customer-accounts/controllers/order-ref.controller.ts";

import { CustomerService } from "./modules/customer-accounts/services/customer.service.ts";
import { AddressService } from "./modules/customer-accounts/services/address.service.ts";
import { OrderRefService } from "./modules/customer-accounts/services/order-ref.service.ts";

import { CustomerRepository } from "./modules/customer-accounts/repositories/customer.repository.ts";
import { AddressRepository } from "./modules/customer-accounts/repositories/address.repository.ts";
import { OrderRefRepository } from "./modules/customer-accounts/repositories/order-ref.repository.ts";

import { connectToModuleDB } from "./shared/db/index.ts";

// ------------------------------------------------------------
// ⚡ Chargement des connexions DB (une par module)
// ------------------------------------------------------------
const customerDb = await connectToModuleDB("customer-accounts");
const addressDb = customerDb; // même DB module customer-accounts
const orderRefDb = customerDb; // idem

// ------------------------------------------------------------
// ⚡ Instanciation des repositories
// ------------------------------------------------------------
const customerRepo = new CustomerRepository(customerDb);
const addressRepo = new AddressRepository(addressDb);
const orderRefRepo = new OrderRefRepository(orderRefDb);

// ------------------------------------------------------------
// ⚡ Instanciation des services
// ------------------------------------------------------------
const customerService = new CustomerService(customerRepo);
const addressService = new AddressService(addressRepo);
const orderRefService = new OrderRefService(orderRefRepo);

// ------------------------------------------------------------
// ⚡ Création des routers
// ------------------------------------------------------------
const customerRouter = createCustomerRouter(customerService);
const addressRouter = createAddressRouter(addressService);
const orderRefRouter = createOrderRefRouter(orderRefService);

// ------------------------------------------------------------
// ⚡ Application Oak
// ------------------------------------------------------------
const app = new Application();

app.use(customerRouter.routes());
app.use(customerRouter.allowedMethods());

app.use(addressRouter.routes());
app.use(addressRouter.allowedMethods());

app.use(orderRefRouter.routes());
app.use(orderRefRouter.allowedMethods());

// ------------------------------------------------------------
// ⛔ Ne pas lancer le serveur pendant les tests
// ------------------------------------------------------------
if (!Deno.env.get("DENO_TEST")) {
  console.log("🚀 Server running on http://localhost:8000");
  await app.listen({ port: 8000 });
}

export default app;
