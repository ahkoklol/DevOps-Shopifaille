// category.repository.ts
import type { Client } from "postgres";
import { CreateCategoryDto, StoreCategory } from "../store.type.ts";

export class CategoryRepository {
  constructor(private db: Client) {}

  async create(
    storeId: string,
    data: CreateCategoryDto,
  ): Promise<StoreCategory> {
    const result = await this.db.queryObject<StoreCategory>(
      `INSERT INTO store_category (store_id, parent_category_id, name, slug, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        storeId,
        data.parent_category_id ?? null,
        data.name,
        data.slug,
        data.sort_order ?? 0,
      ],
    );
    return result.rows[0];
  }

  async list(storeId: string): Promise<StoreCategory[]> {
    const result = await this.db.queryObject<StoreCategory>(
      `SELECT * FROM store_category
       WHERE store_id = $1
       ORDER BY sort_order ASC`,
      [storeId],
    );
    return result.rows;
  }

  async delete(id: string): Promise<void> {
    // On utilise queryObject comme DeliveryRepository pour simplifier les tests
    await this.db.queryObject(`DELETE FROM store_category WHERE id = $1`, [id]);
  }
}
