import type { Context } from "@oak/oak";
import { verifyAccessToken } from "./jwt.ts";

export async function requireAuth(ctx: Context, next: () => Promise<unknown>) {
  const auth = ctx.request.headers.get("Authorization");
  if (!auth) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Missing Authorization header" };
    return;
  }
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid Authorization format" };
    return;
  }
  const res = await verifyAccessToken(token);
  if (!res.valid) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid or expired token" };
    return;
  }
  ctx.state.user = res.payload;
  await next();
}
