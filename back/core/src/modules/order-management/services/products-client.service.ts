export class ProductsClientService {
  // Decrement stock for each (variantId, qty). Return true if OK else false.
  async decrementStock(items: { variantId: string; quantity: number }[]): Promise<boolean> {
    // TODO: call Products via gRPC. Here we simulate success.
    return true;
  }

  // Increment stock (compensation)
  async incrementStock(items: { variantId: string; quantity: number }[]): Promise<boolean> {
    // TODO: call Products via gRPC. Here we simulate success.
    return true;
  }
}
