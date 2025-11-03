import { IngestService } from "../services/ingest.service.ts";
import { IngestEvent } from "../events.type.ts";

export class IngestController {
  constructor(private svc: IngestService) {}
  ingest = (ev: IngestEvent) => this.svc.ingest(ev);
}
