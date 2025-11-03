export interface ReturnItemDTO {
  variantId: string;
  quantity: number;
}

export interface CreateReturnDTO {
  items: ReturnItemDTO[];
  reason?: string;
  refundAmount?: number; // computed if omitted (simple example)
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  items: ReturnItemDTO[];
  refundAmount: number;
  reason?: string;
  createdAt: string;
  type: "PARTIAL" | "TOTAL";
}
