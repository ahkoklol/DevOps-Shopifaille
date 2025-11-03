import { ReturnService } from "../services/return.service.ts";
import { CreateReturnDTO } from "../return.type.ts";

export class ReturnsController {
  constructor(private svc: ReturnService) {}

  create = (orderId: string, dto: CreateReturnDTO) => this.svc.create(orderId, dto);
  list = (orderId: string) => this.svc.list(orderId);
}
