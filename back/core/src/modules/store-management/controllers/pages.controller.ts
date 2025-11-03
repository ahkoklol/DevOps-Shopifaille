import { PageService } from "../services/page.service.ts";
import { PageDTO } from "../page.type.ts";

export class PagesController {
  constructor(private svc: PageService) {}
  list = (storeId: string) => this.svc.list(storeId);
  create = (storeId: string, dto: PageDTO) => this.svc.create(storeId, dto);
  update = (storeId: string, pageId: string, dto: PageDTO) => this.svc.update(storeId, pageId, dto);
  delete = (storeId: string, pageId: string) => this.svc.delete(storeId, pageId);
}
