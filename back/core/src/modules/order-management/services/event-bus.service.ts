import { OrderEvent, OrderEventName } from "../events.type.ts";

export class EventBusService {
  async publish<T>(event: OrderEventName, data: T): Promise<OrderEvent<T>> {
    const payload: OrderEvent<T> = { event, data, at: new Date().toISOString() };
    console.log("[order-event]", JSON.stringify(payload));
    return payload;
  }
}
