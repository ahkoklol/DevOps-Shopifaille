import * as grpc from "npm:@grpc/grpc-js";

// Store Management deps
import { StoreService } from "../../modules/store-management/services/store.service.ts";
import { StoreRepository } from "../../modules/store-management/repositories/store.repository.ts";
import { PlanRepository } from "../../modules/store-management/repositories/plan.repository.ts";
import { EventBusService } from "../../modules/store-management/services/event-bus.service.ts";

// Customization
import { CustomizationRepository } from "../../modules/store-management/repositories/customization.repository.ts";
import { CustomizationService } from "../../modules/store-management/services/customization.service.ts";

// Aggregates (optionnel) via OM
import { OrderRepository } from "../../modules/order-management/repositories/order.repository.ts";
import { AggregatesService } from "../../modules/order-management/services/aggregates.service.ts";

// ------------------------ DI container ------------------------
function buildContainer() {
  const storeRepo = new StoreRepository();
  const planRepo = new PlanRepository();
  const bus = new EventBusService();
  const storeSvc = new StoreService(storeRepo, planRepo, bus);

  const customRepo = new CustomizationRepository();
  const customSvc = new CustomizationService(customRepo);

  const orders = new OrderRepository();
  const aggregates = new AggregatesService(orders);

  return { storeSvc, customSvc, aggregates };
}

// ------------------------ gRPC impl ----------------------------
export function makeStoreHandlers() {
  const { storeSvc, customSvc, aggregates } = buildContainer();

  const impl: Record<string, grpc.handleUnaryCall<any, any>> = {
    CreateStore: async (call, cb) => {
      try {
        const b = call.request;
        const dto = {
          ownerId: b.admin_id ?? b.owner_id,
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

    GetStore: async (call, cb) => {
      try {
        const s = await storeSvc.getStoreById(call.request.id);
        cb(null, s ? { store: toProtoStore(s) } : {});
      } catch (e) { cb(err(e)); }
    },

    // ➕ IMPLEMENTED
    GetStoreByDomain: async (call, cb) => {
      try {
        const s = await storeSvc.getByDomain(call.request.domain);
        cb(null, s ? { store: toProtoStore(s) } : {});
      } catch (e) { cb(err(e)); }
    },

    // Customization now routed to CustomizationService
    UpdateCustomization: async (call, cb) => {
      try {
        const b = call.request;
        const patch = {
          themeSettings: safeParse(b.theme_settings_json),
          headerText: b.header_text ?? undefined,
          imageUrls: safeParse(b.image_urls_json) ?? undefined,
        };
        const c = await customSvc.update(b.store_id, patch);
        cb(null, { customization: toProtoCustomization(c) });
      } catch (e) { cb(err(e)); }
    },

    GetCustomization: async (call, cb) => {
      try {
        const c = await customSvc.get(call.request.store_id);
        cb(null, c ? { customization: toProtoCustomization(c) } : {});
      } catch (e) { cb(err(e)); }
    },

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
  return {
    id: s.id,
    admin_id: s.ownerId,
    domain: s.domain ?? "",
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
