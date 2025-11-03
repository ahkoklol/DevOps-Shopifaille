import { ReturnRecord } from "../return.type.ts";

export class ReturnRepository {
  private returns = new Map<string, ReturnRecord[]>(); // by orderId

  async create(rec: ReturnRecord) {
    const arr = this.returns.get(rec.orderId) ?? [];
    arr.push(rec);
    this.returns.set(rec.orderId, arr);
    return rec;
  }

  async list(orderId: string) {
    return this.returns.get(orderId) ?? [];
  }
}
