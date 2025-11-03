// back/core/src/modules/store-management/grpc/handlers/store_management.handler.ts
import * as grpc from "npm:@grpc/grpc-js";

// --- Store Management module deps (your real paths)
import { StoreService } from "../../modules/store-management/services/store.service.ts";
import { StoreRepository } from "../../modules/store-management/repositories/store.repository.ts";
import { PlanRepository } from "../../modules/store-management/repositories/plan.repository.ts";
import { EventBusService } from "../../modules/store-management/services/event-bus.service.ts";

// --- (Optional) aggregates via Order Management — keep if you expose GetDashboardAggregates
import { OrderRepository } from "../../modules/order-management/repositories/order.repository.ts";
import { AggregatesService } from "../../modules/order-management/services/aggregates.service.ts";

// ------------------------ DI container ------------------------
function buildContainer() {
  // repositories for StoreService
  const storeRepo = new StoreRepository();
  const planRepo = new PlanRepository();
  const bus = new EventBusService();

  // main Store service (matches your constructor signature)
  const storeSvc = new StoreService(storeRepo, planRepo, bus);

  // optional dashboard aggregates (reuse OM repo/service if you have them)
  const orders = new OrderRepository();
  const aggregates = new AggregatesService(orders);

  return { storeSvc, aggregates };
}

// ------------------------ gRPC impl ----------------------------
export function makeStoreHandlers() {
  const { storeSvc, aggregates } = buildContainer();

  const impl: Record<string, grpc.handleUnaryCall<any, any>> = {
    // --- Create a store ---
    CreateStore: async (call, cb) => {
      try {
        const b = call.request;

        // Map proto -> CreateStoreDTO
        const dto = {
          ownerId: b.admin_id ?? b.owner_id,                 // backward compat
          name: b.store_name ?? b.name,
          currency: b.currency ?? "EUR",
          locales: b.locales_json ? safeParse(b.locales_json) : ["fr-FR"],
          timezone: b.timezone ?? "UTC",
          planCode: b.plan_code ?? b.subscription_level ?? "FREE",
        };

        const s = await storeSvc.createStore(dto as any);
        cb(null, { store: toProtoStore(s) });
      } catch (e) { cb(err(e)); }
    },

    // --- Get by id ---
    GetStore: async (call, cb) => {
      try {
        const s = await storeSvc.getStoreById(call.request.id);
        cb(null, s ? { store: toProtoStore(s) } : {});
      } catch (e) { cb(err(e)); }
    },

    /**
     * NOTE: If you no longer support "get by domain" at the service level,
     * you can either remove this RPC from the .proto or implement a thin
     * repository helper and call storeSvc via a custom method.
     * For now we return UNIMPLEMENTED to avoid misleading behavior.
     */
    GetStoreByDomain: async (_call, cb) => {
      cb({
        code: grpc.status.UNIMPLEMENTED,
        name: "Unimplemented",
        message: "GetStoreByDomain is not implemented by StoreService",
      } as grpc.ServiceError);
    },

    /**
     * Former "UpdateCustomization" now routes to StoreService.updateStore.
     * We only apply fields provided in the request to avoid overwriting others.
     */
    UpdateCustomization: async (call, cb) => {
      try {
        const b = call.request;

        // Build a partial UpdateStoreDTO safely
        const patch: Record<string, unknown> = {};
        const theme = safeParse(b.theme_settings_json);
        const images = safeParse(b.image_urls_json);

        // If your Store model contains a "customization" object, adapt here:
        if (theme || b.header_text || images) {
          patch["customization"] = {
            ...(theme ? { themeSettings: theme } : {}),
            ...(b.header_text ? { headerText: b.header_text } : {}),
            ...(images ? { imageUrls: images } : {}),
          };
        }

        const updated = await storeSvc.updateStore(b.store_id, patch as any);
        if (!updated) return cb(null, {}); // not found

        cb(null, { customization: toProtoCustomization((updated as any).customization ?? { storeId: b.store_id }) });
      } catch (e) { cb(err(e)); }
    },

    GetCustomization: async (call, cb) => {
      try {
        const s = await storeSvc.getStoreById(call.request.store_id);
        const c = (s as any)?.customization;
        cb(null, c ? { customization: toProtoCustomization({ ...c, storeId: s!.id }) } : {});
      } catch (e) { cb(err(e)); }
    },

    // --- Dashboard aggregates (optional) ---
    GetDashboardAggregates: async (call, cb) => {
      try {
        const out = await aggregates.getSummary(call.request.store_id, {
          from: call.request.from || undefined,
          to: call.request.to || undefined,
        });
        cb(null, { total: out.total, orders_count: out.orders_count, aov: out.aov });
      } catch (e) { cb(err(e)); }
    },
  };

  return impl;
}

// ------------------------ helpers ------------------------------
function err(e: any): grpc.ServiceError {
  return { code: grpc.status.UNKNOWN, name: e?.name ?? "Error", message: e?.message ?? String(e) } as any;
}

function safeParse(s?: string) { try { return s ? JSON.parse(s) : undefined; } catch { return undefined; } }

function toProtoStore(s: any) {
  // Map your Store model -> proto Store
  return {
    id: s.id,
    admin_id: s.ownerId,                      // proto kept "admin_id"
    domain: s.domain ?? "",                   // if not used, keep empty string
    subscription_level: s.planCode ?? "FREE",
    status: s.status ?? "active",
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function toProtoCustomization(c: any) {
  return {
    store_id: c.storeId,
    theme_settings_json: JSON.stringify(c.themeSettings ?? {}),
    header_text: c.headerText ?? "",
    image_urls_json: JSON.stringify(c.imageUrls ?? []),
  };
}
