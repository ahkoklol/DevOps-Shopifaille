import { DomainService } from "../services/domain.service.ts";
import { DomainDTO } from "../domain.type.ts";

export class DomainsController {
  constructor(private svc: DomainService) {}

  list = (storeId: string) => this.svc.list(storeId);
  add = (storeId: string, dto: DomainDTO) => this.svc.addDomain(storeId, dto.host);
  verify = (storeId: string, domainId: string) => this.svc.verifyDomain(storeId, domainId);
  setPrimary = (storeId: string, domainId: string) => this.svc.setPrimary(storeId, domainId);
}
