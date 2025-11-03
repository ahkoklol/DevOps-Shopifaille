import { OrderService } from "../services/order.service.ts";
import { PlaceOrderDTO, UpdateStatusDTO } from "../order.type.ts";

export class OrdersController {
  constructor(private svc: OrderService) {}

  // Internal from Checkout
  place = (body: PlaceOrderDTO) => this.svc.placeOrder(body);

  // Admin Gateway
  getOne = (orderId: string) => this.svc.getOne(orderId);
  list = (storeId: string, q?: { status?: string; from?: string; to?: string }) =>
    this.svc.listByStore(storeId, { status: q?.status as any, from: q?.from, to: q?.to });

  updateStatus = (orderId: string, dto: UpdateStatusDTO) => this.svc.updateStatus(orderId, dto);

  // Payment webhook/internal
  markPaid = (orderId: string, body: { txId: string; amount: number }) =>
    this.svc.markPaid(orderId, body.txId, body.amount);

  aggregates = (storeId: string, q?: { from?: string; to?: string }) =>
    this.svc.aggregates(storeId, q);
}
