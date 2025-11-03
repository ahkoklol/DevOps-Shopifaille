// back/core/src/grpc/server.ts
// Deno + npm compat
import * as grpc from "npm:@grpc/grpc-js";
import * as protoLoader from "npm:@grpc/proto-loader";

// ---- Handlers (adapte les chemins si besoin) ----
import { makeAccountsHandlers } from "./handlers/accounts.handler.ts";
import { makeOrderHandlers } from "./handlers/orders.handler.ts";
import { makeStoreHandlers } from "./handlers/stores.handler.ts";
import { makeHandlers as makeWebhookHandlers } from "./handlers/webhooks.handler.ts";

// --------- Helpers ---------
const PROTO_OPTIONS: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

function urlToPath(rel: string) {
  return new URL(rel, import.meta.url).pathname;
}

async function loadProto(relPath: string) {
  const def = await protoLoader.load(urlToPath(relPath), PROTO_OPTIONS);
  return grpc.loadPackageDefinition(def) as any;
}

// --------- Boot ---------
const HOST = Deno.env.get("GRPC_HOST") ?? "0.0.0.0";
const PORT = Number(Deno.env.get("GRPC_PORT") ?? "50051");

const server = new grpc.Server();

// Charge tous les protos
const pkgs = {
  // package core.accounts.v1  -> service CustomerAccounts
  accounts: await loadProto("./protos/accounts.proto"),
  // package core.ordermanagement.v1 -> service OrderManagement
  orders: await loadProto("./protos/orders.proto"),
  // package core.storemanagement.v1 -> service StoreManagement
  stores: await loadProto("./protos/stores.proto"),
  // package core.eventwebhooks.v1 -> service EventWebhooks
  webhooks: await loadProto("./protos/webhooks.proto"),
};

// Récupère les espaces de noms attendus (adapte si ton package diffère)
const AccountsNS = pkgs.accounts?.core?.accounts?.v1;
const OrdersNS = pkgs.orders?.core?.ordermanagement?.v1;
const StoresNS = pkgs.stores?.core?.storemanagement?.v1;
const WebhooksNS = pkgs.webhooks?.core?.eventwebhooks?.v1;

// Ajoute chaque service si disponible
if (AccountsNS?.CustomerAccounts?.service) {
  server.addService(AccountsNS.CustomerAccounts.service, makeAccountsHandlers());
  console.log("[grpc] Registered: CustomerAccounts");
} else {
  console.warn("[grpc] WARN: CustomerAccounts service not found in accounts.proto package core.accounts.v1");
}

if (OrdersNS?.OrderManagement?.service) {
  server.addService(OrdersNS.OrderManagement.service, makeOrderHandlers());
  console.log("[grpc] Registered: OrderManagement");
} else {
  console.warn("[grpc] WARN: OrderManagement service not found in orders.proto package core.ordermanagement.v1");
}

if (StoresNS?.StoreManagement?.service) {
  server.addService(StoresNS.StoreManagement.service, makeStoreHandlers());
  console.log("[grpc] Registered: StoreManagement");
} else {
  console.warn("[grpc] WARN: StoreManagement service not found in stores.proto package core.storemanagement.v1");
}

if (WebhooksNS?.EventWebhooks?.service) {
  server.addService(WebhooksNS.EventWebhooks.service, makeWebhookHandlers());
  console.log("[grpc] Registered: EventWebhooks");
} else {
  console.warn("[grpc] WARN: EventWebhooks service not found in webhooks.proto package core.eventwebhooks.v1");
}

// ---- Start server ----
server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(), // passe en TLS si nécessaire
  (err, boundPort) => {
    if (err) {
      console.error("[grpc] bind failed:", err);
      Deno.exit(1);
    }
    console.log(`[grpc] listening on ${HOST}:${boundPort}`);
    server.start();
  },
);

// ---- Graceful shutdown ----
function shutdown(label: string) {
  console.log(`[grpc] ${label} received -> shutting down...`);
  server.tryShutdown((e) => {
    if (e) {
      console.error("[grpc] graceful shutdown error:", e);
      server.forceShutdown();
    }
    Deno.exit(0);
  });
}
["SIGINT", "SIGTERM"].forEach((sig) => {
  try {
    Deno.addSignalListener(sig as Deno.Signal, () => shutdown(sig));
  } catch { /* unsupported on some platforms */ }
});
