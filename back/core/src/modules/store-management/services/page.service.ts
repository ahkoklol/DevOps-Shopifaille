import { PageRepository } from "../repositories/page.repository.ts";
import { EventBusService } from "./event-bus.service.ts";
import { Page, PageDTO } from "../page.type.ts";

export class PageService {
  constructor(private repo: PageRepository, private bus: EventBusService) {}

  async list(storeId: string) { return await this.repo.list(storeId); }

  async create(storeId: string, data: PageDTO) {
    const page: Page = {
      id: crypto.randomUUID(),
      storeId,
      slug: data.slug ?? data.title.toLowerCase().replace(/\s+/g, "-"),
      title: data.title,
      content: data.content,
      type: data.type,
      isPublished: data.isPublished ?? false,
      updatedAt: new Date().toISOString(),
    };
    const out = await this.repo.create(page);
    await this.bus.publish("pages.updated", { storeId, pageId: out.id, action: "created" });
    return out;
  }

  async update(storeId: string, pageId: string, data: PageDTO) {
    const out = await this.repo.update(storeId, pageId, { ...data });
    if (out) await this.bus.publish("pages.updated", { storeId, pageId, action: "updated" });
    return out;
  }

  async delete(storeId: string, pageId: string) {
    const ok = await this.repo.delete(storeId, pageId);
    if (ok) await this.bus.publish("pages.updated", { storeId, pageId, action: "deleted" });
    return ok;
  }
}
