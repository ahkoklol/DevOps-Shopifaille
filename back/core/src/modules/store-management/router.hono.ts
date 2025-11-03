import { Hono } from "hono/mod.ts";

// Repositories
import { StoreRepository } from "./repositories/store.repository.ts";
import { PlanRepository } from "./repositories/plan.repository.ts";
import { DomainRepository } from "./repositories/domain.repository.ts";
import { ThemeRepository } from "./repositories/theme.repository.ts";
import { NavigationRepository } from "./repositories/navigation.repository.ts";
import { PageRepository } from "./repositories/page.repository.ts";
import { CheckoutSettingsRepository } from "./repositories/checkout-settings.repository.ts";

// Services
import { EventBusService } from "./services/event-bus.service.ts";
import { StoreService } from "./services/store.service.ts";
import { PlanService } from "./services/plan.service.ts";
import { DomainService } from "./services/domain.service.ts";
import { ThemeService } from "./services/theme.service.ts";
import { NavigationService } from "./services/navigation.service.ts";
import { PageService } from "./services/page.service.ts";
import { CheckoutSettingsService } from "./services/checkout-settings.service.ts";
import { AnalyticsService } from "./services/analytics.service.ts";

// Controllers
import { StoreController } from "./controllers/store.controller.ts";
import { PlanController } from "./controllers/plan.controller.ts";
import { DomainsController } from "./controllers/domains.controller.ts";
import { ThemeController } from "./controllers/theme.controller.ts";
import { NavigationController } from "./controllers/navigation.controller.ts";
import { PagesController } from "./controllers/pages.controller.ts";
import { CheckoutSettingsController } from "./controllers/checkout-settings.controller.ts";
import { AnalyticsController } from "./controllers/analytics.controller.ts";
import { PublicController } from "./controllers/public.controller.ts";

// Build DI
function buildContainer() {
  const repos = {
    stores: new StoreRepository(),
    plans: new PlanRepository(),
    domains: new DomainRepository(),
    themes: new ThemeRepository(),
    navs: new NavigationRepository(),
    pages: new PageRepository(),
    checkout: new CheckoutSettingsRepository(),
  };
  const bus = new EventBusService();

  const services = {
    store: new StoreService(repos.stores, repos.plans, bus),
    plan: new PlanService(repos.plans, bus),
    domain: new DomainService(repos.domains, bus),
    theme: new ThemeService(repos.themes, bus),
    nav: new NavigationService(repos.navs, bus),
    page: new PageService(repos.pages, bus),
    checkout: new CheckoutSettingsService(repos.checkout, bus),
    analytics: new AnalyticsService(),
  };

  const controllers = {
    store: new StoreController(services.store),
    plan: new PlanController(services.plan),
    domain: new DomainsController(services.domain),
    theme: new ThemeController(services.theme),
    nav: new NavigationController(services.nav),
    page: new PagesController(services.page),
    checkout: new CheckoutSettingsController(services.checkout),
    analytics: new AnalyticsController(services.analytics),
    pub: new PublicController(repos.stores, repos.themes, repos.navs, repos.pages, repos.domains),
  };

  return { controllers };
}

export function buildStoreManagementRouter() {
  const r = new Hono();
  const { controllers: c } = buildContainer();

  // Stores
  r.post("/stores", async (ctx) => ctx.json(await c.store.create(await ctx.req.json())));
  r.get("/stores/:id", async (ctx) => {
    const data = await c.store.getOne(ctx.req.param("id"));
    return data ? ctx.json(data) : ctx.notFound();
  });
  r.patch("/stores/:id", async (ctx) => ctx.json(await c.store.patch(ctx.req.param("id"), await ctx.req.json())));

  // Plan
  r.get("/stores/:id/plan", async (ctx) => ctx.json(await c.plan.get(ctx.req.param("id"))));
  r.put("/stores/:id/plan", async (ctx) => {
    const body = await ctx.req.json(); return ctx.json(await c.plan.put(ctx.req.param("id"), body.planCode));
  });

  // Domains
  r.get("/stores/:id/domains", async (ctx) => ctx.json(await c.domain.list(ctx.req.param("id"))));
  r.post("/stores/:id/domains", async (ctx) => ctx.json(await c.domain.add(ctx.req.param("id"), await ctx.req.json())));
  r.post("/stores/:id/domains/:d/verify", async (ctx) => ctx.json(await c.domain.verify(ctx.req.param("id"), ctx.req.param("d"))));
  r.patch("/stores/:id/domains/:d/primary", async (ctx) => ctx.json(await c.domain.setPrimary(ctx.req.param("id"), ctx.req.param("d"))));

  // Theme
  r.get("/stores/:id/theme", async (ctx) => ctx.json(await c.theme.get(ctx.req.param("id"))));
  r.patch("/stores/:id/theme", async (ctx) => ctx.json(await c.theme.patchDraft(ctx.req.param("id"), await ctx.req.json())));
  r.post("/stores/:id/theme/publish", async (ctx) => ctx.json(await c.theme.publish(ctx.req.param("id"))));

  // Navigation
  r.get("/stores/:id/navigation/:key", async (ctx) => ctx.json(await c.nav.get(ctx.req.param("id"), ctx.req.param("key"))));
  r.put("/stores/:id/navigation/:key", async (ctx) => ctx.json(await c.nav.put(ctx.req.param("id"), ctx.req.param("key"), await ctx.req.json())));

  // Pages
  r.get("/stores/:id/pages", async (ctx) => ctx.json(await c.page.list(ctx.req.param("id"))));
  r.post("/stores/:id/pages", async (ctx) => ctx.json(await c.page.create(ctx.req.param("id"), await ctx.req.json())));
  r.patch("/stores/:id/pages/:pageId", async (ctx) => ctx.json(await c.page.update(ctx.req.param("id"), ctx.req.param("pageId"), await ctx.req.json())));
  r.delete("/stores/:id/pages/:pageId", async (ctx) => ctx.json({ deleted: await c.page.delete(ctx.req.param("id"), ctx.req.param("pageId")) }));

  // Checkout settings
  r.get("/stores/:id/checkout-settings", async (ctx) => ctx.json(await c.checkout.get(ctx.req.param("id"))));
  r.put("/stores/:id/checkout-settings", async (ctx) => ctx.json(await c.checkout.put(ctx.req.param("id"), await ctx.req.json())));
  r.get("/internal/stores/:id/checkout-settings", async (ctx) => ctx.json(await c.checkout.getInternal(ctx.req.param("id"))));

  // Analytics
  r.get("/stores/:id/analytics/summary", async (ctx) => {
    const range = ctx.req.query("range") ?? "7d";
    return ctx.json(await c.analytics.summary(ctx.req.param("id"), range));
  });

  // Public config for Store Gateway
  r.get("/public/stores/:id/config", async (ctx) => {
    const cfg = await c.pub.getPublicConfig(ctx.req.param("id"));
    return cfg ? ctx.json(cfg) : ctx.notFound();
  });

  return r;
}
