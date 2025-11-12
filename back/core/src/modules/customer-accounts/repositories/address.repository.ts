// back/core/src/modules/customer-accounts/repositories/address.repository.ts
import { connectToModuleDB } from "../../../shared/db/index.ts";
import { CustomerAddress } from "../account.type.ts";

const db = await connectToModuleDB("customer-accounts");

export class AddressRepository {
  async listByCustomer(customerId: string): Promise<CustomerAddress[]> {
    const result = await db.queryObject<CustomerAddress>(
      "SELECT * FROM customer_address WHERE customer_id = $1 ORDER BY is_default DESC",
      [customerId],
    );
    return result.rows;
  }

  async create(data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const result = await db.queryObject<CustomerAddress>(
      `INSERT INTO customer_address 
        (customer_id, type, line1, line2, city, region, postal_code, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.customer_id,
        data.type,
        data.line1,
        data.line2,
        data.city,
        data.region,
        data.postal_code,
        data.country,
        data.is_default ?? false,
      ],
    );
    return result.rows[0];
  }

  async setDefaultAddress(customerId: string, addressId: string): Promise<void> {
    await db.queryArray(
      `UPDATE customer_address SET is_default = FALSE WHERE customer_id = $1`,
      [customerId],
    );
    await db.queryArray(
      `UPDATE customer_address SET is_default = TRUE WHERE id = $1`,
      [addressId],
    );
  }

  async delete(id: string): Promise<void> {
    await db.queryArray("DELETE FROM customer_address WHERE id = $1", [id]);
  }
}