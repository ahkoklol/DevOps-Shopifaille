import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import { DlqRepository } from "../repositories/dlq.repository.ts";

export class DeliveriesController {
  constructor(private deliveries: DeliveryRepository, private dlq: DlqRepository) {}

  list = (endpointId: string) => this.deliveries.listByEndpoint(endpointId, 200);

  dlqList = (endpointId: string) => this.dlq.listByEndpoint(endpointId);

  dlqRemove = (dlqId: string) => this.dlq.remove(dlqId);

  get = (deliveryId: string) => this.deliveries.get(deliveryId);
}
