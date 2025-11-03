import { PlanRepository } from "../repositories/plan.repository.ts";
import { EventBusService } from "./event-bus.service.ts";

export class PlanService {
  constructor(private plans: PlanRepository, private bus: EventBusService) {}

  async getPlan(storeId: string) { return await this.plans.get(storeId); }

  async updatePlan(storeId: string, planCode: string) {
    const features = this.featuresForPlan(planCode);
    const row = await this.plans.set(storeId, planCode, features);
    await this.bus.publish("store.plan.changed", { storeId, planCode, features });
    return row;
  }

  private featuresForPlan(code: string) {
    switch (code) {
      case "PRO": return ["themes.custom", "domains.custom", "analytics.basic"];
      case "BUSINESS": return ["themes.custom", "domains.custom", "analytics.advanced", "webhooks"];
      default: return ["themes.basic"];
    }
  }
}
