import { Router } from "@oak/oak";
import { AuthService } from "./auth.service.ts";

export function createAuthRouter(authService: AuthService) {
  const router = new Router({ prefix: "/auth" });

  router.post("/register", async (ctx) => {
    const body = await ctx.request.body({ type: "json" }).value;
    try {
      const tokens = await authService.register(body);
      ctx.response.body = tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  router.post("/login", async (ctx) => {
    const { email, password } = await ctx.request.body({ type: "json" }).value;
    try {
      const tokens = await authService.login(email, password);
      ctx.response.body = tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  router.post("/refresh", async (ctx) => {
    const { refresh } = await ctx.request.body({ type: "json" }).value;
    try {
      const tokens = await authService.refresh(refresh);
      ctx.response.body = tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  router.post("/logout", async (ctx) => {
    const { customerId } = await ctx.request.body({ type: "json" }).value;
    try {
      await authService.logout(customerId);
      ctx.response.body = { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
