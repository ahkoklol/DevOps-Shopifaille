import { hashPassword, verifyPassword } from "./hash.ts";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "./jwt.ts";
import { AuthRepository } from "./auth.repository.ts";
import { CustomerRepository } from "../modules/customer-accounts/repositories/customer.repository.ts";
import * as bcrypt from "bcrypt";

const REFRESH_LIFETIME_SEC = Number(
  Deno.env.get("REFRESH_TOKEN_EXPIRES_SEC") ?? 2592000,
);

export interface RefreshTokenPayload {
  sub: string;
  email?: string;
}

export class AuthService {
  constructor(
    private customerRepo: CustomerRepository,
    private authRepo: AuthRepository,
  ) {}

  async register(
    data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      store_id: string;
    },
  ) {
    const existing = await this.customerRepo.findByEmail(data.email);
    if (existing) throw new Error("Customer already exists");

    const password_hash = await hashPassword(data.password);

    const user = await this.customerRepo.createDb({
      ...data,
      password_hash,
      is_guest: false,
    });

    return this.issueTokens(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.customerRepo.findDbByEmail(email);
    if (!user || !user.password_hash) throw new Error("Invalid credentials");

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(customerId: string, email: string) {
    const access = await createAccessToken({ sub: customerId, email });
    const refresh = await createRefreshToken({ sub: customerId });

    const hash = await hashPassword(refresh);
    const expiresAt = new Date(Date.now() + REFRESH_LIFETIME_SEC * 1000)
      .toISOString();

    await this.authRepo.saveRefreshToken(customerId, hash, expiresAt);

    return { access, refresh };
  }

  async refresh(refreshToken: string) {
    const v = await verifyRefreshToken(refreshToken);
    if (!v.valid) throw new Error("Invalid refresh token");

    if (!v.valid || !v.payload || !v.payload.sub) {
      throw new Error("Invalid refresh token");
    }
    const customerId = v.payload.sub;

    const tokens = await this.authRepo.findTokensByCustomer(customerId);

    let match = null;
    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.token_hash)) {
        match = t;
        break;
      }
    }

    if (!match) throw new Error("Refresh token revoked");

    // rotation
    await this.authRepo.deleteToken(match.id);

    const customer = await this.customerRepo.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    return this.issueTokens(customerId, customer.email);
  }

  async logout(customerId: string) {
    await this.authRepo.deleteAllForCustomer(customerId);
  }
}
