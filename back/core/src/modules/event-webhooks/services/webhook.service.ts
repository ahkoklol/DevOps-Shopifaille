import { WebhookEndpoint, WebhookStatus } from "../webhook.type.ts";
import { WebhookRepository } from "../repositories/webhook.repository.ts";
import { SchemaRegistryService } from "./schema-registry.service.ts";

export class WebhookService {
  constructor(private repo: WebhookRepository, private registry: SchemaRegistryService) {}

  async create(input: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt" | "status"> & { status?: WebhookStatus }) {
    // Validate topics
    for (const t of input.topics) {
      if (!this.registry.validateTopicVersion(t)) throw new Error(`INVALID_TOPIC:${t}`);
    }
    const now = new Date().toISOString();
    const row: WebhookEndpoint = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      status: input.status ?? "active",
      ...input,
    };
    return this.repo.create(row);
  }

  get(id: string) { return this.repo.get(id); }

  update(id: string, patch: Partial<WebhookEndpoint>) {
    if (patch.topics) {
      for (const t of patch.topics) {
        if (!this.registry.validateTopicVersion(t)) throw new Error(`INVALID_TOPIC:${t}`);
      }
    }
    return this.repo.update(id, patch);
  }

  delete(id: string) { return this.repo.delete(id); }

  listByStore(storeId: string) { return this.repo.listByStore(storeId); }

  async rotateSecret(id: string, graceSeconds = 3600) {
    const ep = await this.repo.get(id); if (!ep) throw new Error("NOT_FOUND");
    const now = new Date();
    const graceUntil = new Date(now.getTime() + graceSeconds * 1000).toISOString();
    const patch = {
      prevSecret: ep.secret,
      secret: crypto.randomUUID(),
      secretGraceUntil: graceUntil,
    };
    return this.repo.update(id, patch);
  }
}
