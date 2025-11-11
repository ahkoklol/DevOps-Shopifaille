import { OrderRepository as repo } from '../repositories/order.repository';
import type { CreateOrderDto, TxStatus } from '../order.type';
import { publish } from '../../../shared/events';

export const OrderService = {
  async createOrder(dto: CreateOrderDto) {
    const amounts = calcTotals(dto);
    const order = await repo.insertOrderWithItems({
      orderBase: {
        customer_id: dto.customer_id,
        contact_email: dto.contact_email,
        shipping_address_json: dto.shipping_address_json,
        billing_address_json: dto.billing_address_json ?? null,
        currency: dto.currency
      },
      items: dto.items.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        qty: i.qty,
        unit_price: i.unit_price,
        title: i.title,
        sku: i.sku,
        attrs: i.attrs
      })),
      amounts
    });

    await publish('order.created', { order_id: order.id, customer_id: order.customer_id, grand_total: order.grand_total });
    return order;
  },

  async capturePayment(orderId: string, provider: string, reference: string, amount: number) {
    const tx = await repo.recordPayment({ order_id: orderId, provider, reference, amount, status: 'CAPTURED' as TxStatus });
    await repo.appendStatus(orderId, 'PAID', 'payment captured', { provider, reference, amount });
    await publish('order.paid', { order_id: orderId, tx_id: tx.id, amount });
    return tx;
  },

  async markFulfilled(orderId: string) {
    await repo.appendStatus(orderId, 'FULFILLED', 'shipment completed');
    await publish('order.fulfilled', { order_id: orderId });
  },

  async cancelOrder(orderId: string, reason?: string) {
    await repo.appendStatus(orderId, 'CANCELLED', reason ?? 'cancelled by admin');
    await publish('order.cancelled', { order_id: orderId, reason: reason ?? null });
  },

  getOrder: (id: string) => repo.getOrderWithItems(id)
};

function calcTotals(dto: CreateOrderDto) {
  const subtotal = dto.items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const discount = dto.discounts ?? 0;
  const tax = dto.tax ?? 0;
  const shipping = dto.shipping ?? 0;
  const grand = subtotal - discount + tax + shipping;
  return { subtotal, discount, tax, shipping, grand };
}
