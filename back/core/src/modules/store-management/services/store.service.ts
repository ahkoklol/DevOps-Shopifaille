// back/core/src/modules/store-management/services/store.service.ts

import { Store, CreateStoreDTO, UpdateStoreDTO } from "../store.type.ts";
import { StoreRepository } from "../repositories/store.repository.ts";
import { PlanRepository } from "../repositories/plan.repository.ts";
import { EventBusService } from "./event-bus.service.ts";

/**
 * StoreService
 * - Owns the lifecycle of a Store entity (create/read/update/plan change)
 * - Publishes domain events for other modules (webhooks, analytics, provisioning)
 * - Delegates persistence to repositories
 *
 * NOTE:
 *   - Store customization is handled by CustomizationService (separate table/service).
 *   - This service focuses on Store core fields (name, domain, plan, status, etc.).
 */
export class StoreService {
  constructor(
    private readonly stores: StoreRepository,
    private readonly plans: PlanRepository,
    private readonly bus: EventBusService,
  ) {}

  /**
   * Create a new store with an initial plan and default settings.
   * Emits: store.created
   */
  async createStore(dto: CreateStoreDTO): Promise<Store> {
    const now = isoNow();

    const store: Store = {
      id: crypto.randomUUID(),
      ownerId: dto.ownerId,
      name: dto.name.trim(),
      currency: dto.currency ?? "EUR",
      locales: normalizeLocales(dto.locales),
      timezone: dto.timezone ?? "UTC",
      status: "active",
      createdAt: now,
      updatedAt: now,
      planCode: dto.planCode ?? "FREE",
      // Optional fields if your type includes them
      domain: (dto as any)?.domain ?? undefined,
    };

    await this.stores.insert(store);

    // Initialize plan features for this store
    const features = this.featuresForPlan(store.planCode);
    await this.plans.set(store.id, store.planCode, features);

    // Domain event for the rest of the platform (provisioning, emails, etc.)
    await this.bus.publish("store.created", {
      storeId: store.id,
      ownerId: store.ownerId,
      plan: store.planCode,
    });

    return store;
  }

  /**
   * Get a store by its identifier.
   */
  async getStoreById(storeId: string): Promise<Store | null> {
    return this.stores.findById(storeId);
  }

  /**
   * Get a store by its domain (if you support custom domains or subdomains).
   */
  async getByDomain(domain: string): Promise<Store | null> {
    const d = domain?.trim().toLowerCase();
    if (!d) return null;
    return this.stores.findByDomain(d);
  }

  /**
   * Update store core fields (patch).
   * Emits: store.updated and optionally store.status.changed or store.plan.changed
   */
  async updateStore(storeId: string, patch: UpdateStoreDTO): Promise<Store | null> {
    // Normalize a safe patch object
    const safePatch: Partial<Store> = {};
    if (isString(patch.name)) safePatch.name = patch.name!.trim();
    if (isString(patch.currency)) safePatch.currency = patch.currency!;
    if (isArray(patch.locales)) safePatch.locales = normalizeLocales(patch.locales);
    if (isString(patch.timezone)) safePatch.timezone = patch.timezone!;
    if (isString(patch.status)) safePatch.status = patch.status as Store["status"];
    if (isString((patch as any).domain)) (safePatch as any).domain = (patch as any).domain!.trim().toLowerCase();

    // Apply patch first
    const updated = await this.stores.update(storeId, safePatch);
    if (!updated) return null;

    // If planCode is present, treat it as a plan change (atomic follow-up)
    if (isString(patch.planCode)) {
      const newPlan = patch.planCode!;
      await this.applyPlanChange(updated, newPlan);
      // Refresh "updated" to return a consistent result
      const refreshed = await this.stores.findById(storeId);
      await this.bus.publish("store.plan.changed", { storeId, to: newPlan });
      await this.bus.publish("store.updated", { storeId, changes: { ...safePatch, planCode: newPlan } });
      if (isString(patch.status)) {
        await this.bus.publish("store.status.changed", { storeId, to: patch.status });
      }
      return refreshed!;
    }

    // Publish events for a regular update (no plan change)
    await this.bus.publish("store.updated", { storeId, changes: safePatch });
    if (isString(patch.status)) {
      await this.bus.publish("store.status.changed", { storeId, to: patch.status });
    }

    return updated;
  }

  /**
   * Map plan code to feature flags available for this store.
   * Keep it explicit and idempotent.
   */
  featuresForPlan(code: string): string[] {
    switch ((code ?? "").toUpperCase()) {
      case "PRO":
        return ["themes.custom", "domains.custom", "analytics.basic"];
      case "BUSINESS":
        return ["themes.custom", "domains.custom", "analytics.advanced", "webhooks"];
      case "FREE":
      default:
        return ["themes.basic"];
    }
  }

  /**
   * Internal: persist a plan change + features for a given store.
   */
  private async applyPlanChange(current: Store, newPlanCode: string): Promise<void> {
    const normalized = (newPlanCode ?? "FREE").toUpperCase();
    if (current.planCode === normalized) {
      // Nothing to do; still emit a no-op if you want audit logs elsewhere.
      return;
    }
    // Persist plan code on the store
    await this.stores.update(current.id, { planCode: normalized, updatedAt: isoNow() } as Partial<Store>);
    // Persist features aligned with that plan
    const features = this.featuresForPlan(normalized);
    await this.plans.set(current.id, normalized, features);
  }
}

/* ----------------------------- utils ----------------------------- */

function isoNow(): string {
  return new Date().toISOString();
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function normalizeLocales(locales?: string[] | null): string[] {
  if (!locales || locales.length === 0) return ["en-US"];
  return locales
    .map((l) => (typeof l === "string" ? l.trim() : ""))
    .filter((l) => l.length > 0);
}
