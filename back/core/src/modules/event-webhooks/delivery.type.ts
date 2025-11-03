export type DeliveryStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "RETRIABLE" | "DLQ";

export interface DeliveryLog {
  id: string;
  endpointId: string;
  eventId: string;
  attempt: number;
  status: DeliveryStatus;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  signatureHash?: string;
  latencyMs?: number;
  createdAt: string;
  nextAttemptAt?: string;
  lastTriedAt?: string;
}

export interface DlqRecord {
  id: string;
  endpointId: string;
  eventId: string;
  lastError: string;
  createdAt: string;
}
