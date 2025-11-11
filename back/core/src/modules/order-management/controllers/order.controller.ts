import { OrderService } from '../services/order.service';

export const OrderController = {
  createOrder: (dto: any) => OrderService.createOrder(dto),
  getOrder: (id: string) => OrderService.getOrder(id),
  capturePayment: (id: string, dto: { provider: string; reference: string; amount: number; }) =>
    OrderService.capturePayment(id, dto.provider, dto.reference, dto.amount),
  fulfill: (id: string) => OrderService.markFulfilled(id),
  cancel: (id: string, reason?: string) => OrderService.cancelOrder(id, reason)
};
