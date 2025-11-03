import { NavigationService } from "../services/navigation.service.ts";
import { NavKey } from "../navigation.type.ts";

export class NavigationController {
  constructor(private svc: NavigationService) {}
  get = (storeId: string, key: string) => this.svc.getNavigation(storeId, key as NavKey);
  put = (storeId: string, key: string, items: any[]) => this.svc.updateNavigation(storeId, key as NavKey, items);
}
