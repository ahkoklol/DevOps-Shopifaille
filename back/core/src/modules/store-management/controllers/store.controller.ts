import { Router } from "@oak/oak";
import { StoreService } from "../services/store.service.ts";

const router = new Router({ prefix: "/stores" });
const service = new StoreService();

router.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const store = await service.createStore(body);
    ctx.response.status = 201;
    ctx.response.body = store;
  } catch (err) {
    ctx.response.status = 400;
    ctx.response.body = { error: String(err) };
  }
});

router.get("/:id", async (ctx) => {
  const store = await service.getStore(ctx.params.id!);
  if (!store) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Store not found" };
    return;
  }
  ctx.response.body = store;
});

router.get("/owner/:ownerId", async (ctx) => {
  ctx.response.body = await service.listStoresForOwner(ctx.params.ownerId!);
});

export default router;
