import { create, getNumericDate, Header, verify } from "djwt";
import { RefreshTokenPayload } from "./auth.service.ts";

const ACCESS_EXPIRES = Number(
  Deno.env.get("ACCESS_TOKEN_EXPIRES_SEC") ?? "604800",
); // 7 days default
const REFRESH_EXPIRES = Number(
  Deno.env.get("REFRESH_TOKEN_EXPIRES_SEC") ?? "2592000",
); // 30 days default
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "change_me";
const JWT_REFRESH_SECRET = Deno.env.get("JWT_REFRESH_SECRET") ??
  "change_me_refresh";

const header: Header = { alg: "HS512", typ: "JWT" };

export interface RefreshTokenVerification {
  valid: boolean;
  payload?: RefreshTokenPayload;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    enc,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign", "verify"],
  );
}

const accessKey = await importKey(JWT_SECRET);
const refreshKey = await importKey(JWT_REFRESH_SECRET);

/** Create access token */
export async function createAccessToken(payload: Record<string, unknown>) {
  const jwtPayload = {
    ...payload,
    iat: getNumericDate(0),
    exp: getNumericDate(ACCESS_EXPIRES),
  };
  return await create(header, jwtPayload, accessKey);
}

/** Create refresh token (signed with separate secret) */
export async function createRefreshToken(payload: Record<string, unknown>) {
  const jwtPayload = {
    ...payload,
    iat: getNumericDate(0),
    exp: getNumericDate(REFRESH_EXPIRES),
  };
  return await create(header, jwtPayload, refreshKey);
}

/** Verify access token */
export async function verifyAccessToken(token: string) {
  try {
    const payload = await verify(token, accessKey);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err };
  }
}

/** Verify refresh token */
export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenVerification> {
  try {
    const payload = await verify(token, refreshKey) as RefreshTokenPayload;
    return { valid: true, payload };
  } catch (_err) {
    return { valid: false };
  }
}
