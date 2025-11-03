import { AggregatesService } from "../services/aggregates.service.ts";

export class AggregatesController {
  constructor(private svc: AggregatesService) {}
  summary = (storeId: string, q?: { from?: string; to?: string }) => this.svc.getSummary(storeId, q);
}
