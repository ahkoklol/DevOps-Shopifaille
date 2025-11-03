import { ThemeService } from "../services/theme.service.ts";
import { ThemeDTO } from "../theme.type.ts";

export class ThemeController {
  constructor(private svc: ThemeService) {}

  get = (storeId: string) => this.svc.getTheme(storeId);
  patchDraft = (storeId: string, dto: ThemeDTO) => this.svc.updateDraft(storeId, dto);
  publish = (storeId: string) => this.svc.publish(storeId);
}
