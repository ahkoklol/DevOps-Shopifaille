import { PlanService } from "../services/plan.service.ts";

export class PlanController {
  constructor(private svc: PlanService) {}
  get = async (storeId: string) => this.svc.getPlan(storeId);
  put = async (storeId: string, planCode: string) => this.svc.updatePlan(storeId, planCode);
}
