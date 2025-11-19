import { connectToModuleDB } from "../../../shared/db/index.ts";
import { MerchantStore, CreateStoreDto } from "../store.type.ts";

const db = await connectToModuleDB("store-management");

export class StoreRepository {
  async create(data: CreateStoreDto): Promise<MerchantStore> {
    const plan = data.plan ?? "free";

    const result = await db.queryObject<MerchantStore>(
      `INSERT INTO merchant_store (owner_user_id, name, subdomain, custom_domain, plan, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING *`,
      [
        data.owner_user_id,
        data.name,
        data.subdomain,
        data.custom_domain ?? null,
        plan,
      ],
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<MerchantStore | null> {
    const result = await db.queryObject<MerchantStore>(
      `SELECT * FROM merchant_store WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findBySubdomain(subdomain: string): Promise<MerchantStore | null> {
    const result = await db.queryObject<MerchantStore>(
      `SELECT * FROM merchant_store WHERE subdomain = $1`,
      [subdomain],
    );
    return result.rows[0] ?? null;
  }

  async listByOwner(ownerId: string): Promise<MerchantStore[]> {
    const result = await db.queryObject<MerchantStore>(
      `SELECT * FROM merchant_store
       WHERE owner_user_id = $1
       ORDER BY created_at DESC`,
      [ownerId],
    );
    return result.rows;
  }
}
