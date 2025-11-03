import { DomainRepository } from "../repositories/domain.repository.ts";
import { EventBusService } from "./event-bus.service.ts";
import { Domain } from "../domain.type.ts";

export class DomainService {
  constructor(private repo: DomainRepository, private bus: EventBusService) {}

  async addDomain(storeId: string, host: string) {
    const domain: Domain = {
      id: crypto.randomUUID(),
      storeId, host,
      isPrimary: false,
      verificationStatus: "pending",
    };
    await this.repo.add(domain);
    await this.bus.publish("domain.added", { storeId, domainId: domain.id, host });
    return domain;
  }

  async verifyDomain(storeId: string, domainId: string) {
    const updated = await this.repo.update(storeId, domainId, { verificationStatus: "verified" });
    if (updated) await this.bus.publish("domain.verified", { storeId, domainId });
    return updated;
  }

  async setPrimary(storeId: string, domainId: string) {
    const primary = await this.repo.setPrimary(storeId, domainId);
    if (primary) await this.bus.publish("domain.primary.changed", { storeId, domainId });
    return primary;
  }

  async list(storeId: string) { return this.repo.list(storeId); }
}
