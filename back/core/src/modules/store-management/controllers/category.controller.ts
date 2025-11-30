// category.controller.ts
import { Router } from "@oak/oak";
import type { CategoryService } from "../services/category.service.ts";

function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createCategoryRouter(service: CategoryService) {
  const router = new Router({ prefix: "/stores/:storeId/categories" });

  router.get("/", async (ctx) => {
    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      const list = await service.listCategories(storeId);
      ctx.response.body = list;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  router.post("/", async (ctx) => {
    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      const body = await ctx.request.body({ type: "json" }).value;
      const category = await service.createCategory(storeId, body);
      ctx.response.status = 201;
      ctx.response.body = category;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  router.delete("/:id", async (ctx) => {
    try {
      const id = requireParam(ctx.params.id, "id");
      await service.deleteCategory(id);
      ctx.response.status = 204;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
