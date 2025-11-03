import { AnalyticsService } from "../services/analytics.service.ts";

export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}
  summary = (storeId: string, range: string) => this.svc.getSalesSummary(storeId, range);
}
