import { ThemeRepository } from "../repositories/theme.repository.ts";
import { EventBusService } from "./event-bus.service.ts";
import { Theme, ThemeDTO } from "../theme.type.ts";

export class ThemeService {
  constructor(private repo: ThemeRepository, private bus: EventBusService) {}

  async getTheme(storeId: string) {
    const draft = await this.repo.getDraft(storeId);
    const live = await this.repo.getLive(storeId);
    return { draft, live };
  }

  async updateDraft(storeId: string, dto: ThemeDTO) {
    const draft: Theme = {
      id: crypto.randomUUID(),
      storeId,
      variables: dto.variables,
      assets: dto.assets ?? {},
      status: "draft",
    };
    return await this.repo.saveDraft(storeId, draft);
  }

  async publish(storeId: string) {
    const draft = await this.repo.getDraft(storeId);
    const toPublish: Theme = draft ?? {
      id: crypto.randomUUID(),
      storeId,
      variables: {},
      assets: {},
      status: "draft",
    };
    const live = await this.repo.publish(storeId, toPublish);
    await this.bus.publish("theme.published", { storeId, version: live.version });
    return live;
  }
}
