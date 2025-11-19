import { connectToModuleDB } from "../../../shared/db/index.ts";
import { CreateCategoryDto, StoreCategory } from "../store.type.ts";

const db = await connectToModuleDB("store-management");

export class CategoryRepository {
  async create(
    storeId: string, 
    data: CreateCategoryDto,
  ): Promise<StoreCategory> {
    const result = await db.queryObject<StoreCategory>(
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
    const result = await db.queryObject<StoreCategory>(
      `SELECT * FROM store_category
       WHERE store_id = $1
       ORDER BY sort_order ASC`,
      [storeId],
    );
    return result.rows;
  }

  async delete(id: string): Promise<void> {
    await db.queryArray(`DELETE FROM store_category WHERE id = $1`, [id]);
  }
}
