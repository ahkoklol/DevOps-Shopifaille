import { WebhookService } from "../services/webhook.service.ts";
import { WebhookEndpoint } from "../webhook.type.ts";

export class WebhooksController {
  constructor(private svc: WebhookService) {}

  create = (input: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt" | "status"> & { status?: "active" | "paused" | "disabled" }) =>
    this.svc.create(input);

  get = (id: string) => this.svc.get(id);

  listByStore = (storeId: string) => this.svc.listByStore(storeId);

  update = (id: string, patch: Partial<WebhookEndpoint>) => this.svc.update(id, patch);

  delete = (id: string) => this.svc.delete(id);

  rotateSecret = (id: string, graceSeconds?: number) => this.svc.rotateSecret(id, graceSeconds ?? 3600);
}
