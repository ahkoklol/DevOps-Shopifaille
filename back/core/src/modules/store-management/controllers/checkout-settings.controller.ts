import { CheckoutSettingsService } from "../services/checkout-settings.service.ts";
import { CheckoutSettingsDTO } from "../checkout-settings.type.ts";

export class CheckoutSettingsController {
  constructor(private svc: CheckoutSettingsService) {}
  get = (storeId: string) => this.svc.get(storeId);
  put = (storeId: string, dto: CheckoutSettingsDTO) => this.svc.update(storeId, dto);
  getInternal = (storeId: string) => this.svc.get(storeId);
}
