import { Router } from "@oak/oak";
import { CategoryService } from "../services/category.service.ts";

const router = new Router({ prefix: "/stores/:storeId/categories" });
const service = new CategoryService();

router.get("/", async (ctx) => {
  ctx.response.body = await service.listCategories(ctx.params.storeId!);
});

router.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const category = await service.createCategory(ctx.params.storeId!, body);
    ctx.response.status = 201;
    ctx.response.body = category;
  } catch (err) {
    ctx.response.status = 400;
    ctx.response.body = { error: String(err) };
  }
});

router.delete("/:id", async (ctx) => {
  await service.deleteCategory(ctx.params.id!);
  ctx.response.status = 204;
});

export default router;
